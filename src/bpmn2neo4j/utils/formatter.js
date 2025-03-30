/**
 * Formats the BPMN data in JSON format into an object containing 2 arrays: nodes and relationships
 * These arrays constitute our LPG
 *  
 * @param {object} bpmnJson - BPMN data in JSON format
 * @returns {object} BPMN data separated into Nodes and Relationships
 */
const formatter = (bpmnJson) => {
    let neo4jData = {
        nodes: [],
        relationships: []
    };

    if (
        bpmnJson === null ||
        bpmnJson === undefined ||
        Object.keys(bpmnJson).length === 0
    ) {
        return neo4jData;
    }

    const process = bpmnJson.rootElement.rootElements[0];
    const references = bpmnJson.references;
    const elementsById = bpmnJson.elementsById;

    const handleFlowElement = (flowElement) => {
        if (flowElement.$type === 'bpmn:DataObject' || flowElement.$type === 'bpmn:Group') {
            // Reject DataObject and Groups
            return;
        }
        if (flowElement.$type === 'bpmn:SubProcess') {
            // handle SubProcesses 
            handleProcess(flowElement)
        } else if (
            // Edges
            flowElement.$type === 'bpmn:SequenceFlow' ||
            flowElement.$type === 'bpmn:MessageFlow' ||
            flowElement.$type === 'bpmn:Association'
        ) {
            const sourceId = (references.filter((reference) => (reference.element.id === flowElement.id && reference.property === 'bpmn:sourceRef')))[0].id
            const targetId = (references.filter((reference) => (reference.element.id === flowElement.id && reference.property === 'bpmn:targetRef')))[0].id
            neo4jData.relationships.push({
                ...flowElement,
                $type: flowElement.$type.substring(5),
                source: sourceId,
                target: targetId,
                name: flowElement.name || ''
            })
        } else {
            // Node
            if (flowElement.$type === 'bpmn:TextAnnotation') {
                neo4jData.nodes.push({
                    ...flowElement,
                    name: flowElement.text,
                    $type: flowElement.$type.substring(5)
                })
            } else {
                var type = flowElement.$type.substring(5);
                if (flowElement.$type.length >= 5 && flowElement.$type.substring(flowElement.$type.length - 5, flowElement.$type.length) === "Event") {
                    type += ":Event"
                }

                if (flowElement.$type.length >= 4 && flowElement.$type.substring(flowElement.$type.length - 4, flowElement.$type.length) === "Task") {
                    type += ":Task"
                }

                if (flowElement.$type.length >= 7 && flowElement.$type.substring(flowElement.$type.length - 7, flowElement.$type.length) === "Gateway") {
                    type += ":Gateway"
                }

                neo4jData.nodes.push({
                    ...flowElement,
                    $type: type,
                })

                if (flowElement.$type === 'bpmn:BoundaryEvent') {
                    const boundaryEventReferences = references.filter(reference => ((reference.element.id === flowElement.id) && (reference.property === 'bpmn:attachedToRef')))
                    boundaryEventReferences?.forEach(boundaryEventReference => {
                        neo4jData.relationships.push({
                            $type: 'AttachedTo',
                            source: flowElement.id,
                            target: boundaryEventReference.id
                        })
                    })
                }
            }

            flowElement.dataInputAssociations?.forEach((dataInputAssociation) => {
                const sourceId = (references.filter((reference) => (reference.element.id === dataInputAssociation.id && reference.property === 'bpmn:sourceRef')))[0]?.id
                neo4jData.relationships.push({
                    ...dataInputAssociation,
                    $type: dataInputAssociation.$type.substring(5),
                    source: sourceId,
                    target: flowElement.id
                })
            })

            flowElement.dataOutputAssociations?.forEach((dataOutputAssociation) => {
                const targetId = (references.filter((reference) => (reference.element.id === dataOutputAssociation.id && reference.property === 'bpmn:targetRef')))[0]?.id
                neo4jData.relationships.push({
                    ...dataOutputAssociation,
                    $type: dataOutputAssociation.$type.substring(5),
                    source: flowElement.id,
                    target: targetId,
                })
            })
        }
    }

    const handleLane = (laneObj) => {
        neo4jData.nodes.push({
            $type: 'Lane',
            id: laneObj.id,
            name: laneObj.name
        })

        if (laneObj.childLaneSet) {
            laneObj.childLaneSet.lanes.forEach((lane) => {
                neo4jData.relationships.push({
                    $type: 'ContainsLane',
                    source: laneObj.id,
                    target: lane.id
                })
                handleLane(lane)
            })

            return;
        }

        const laneObjReferences = references.filter(reference => (reference.element.id === laneObj.id))
        laneObjReferences.forEach((laneObjReference) => {
            const flowNode = elementsById[laneObjReference.id]
            neo4jData.relationships.push({
                $type: 'ContainsElement',
                source: laneObj.id,
                target: flowNode.id
            })
        })
    }

    const handleProcess = (processObj) => {
        neo4jData.nodes.push({
            ...processObj,
            $type: processObj.$type.substring(5),
            id: processObj.id,
            name: processObj.name || ''
        })
        processObj.laneSets?.forEach((laneSet) => {
            laneSet.lanes.forEach((lane) => {
                handleLane(lane);
                neo4jData.relationships.push({
                    $type: 'ContainsLane',
                    source: processObj.id,
                    target: lane.id
                })
            })
        })

        processObj.flowElements?.forEach(flowElement => {
            handleFlowElement(flowElement);
            if (!processObj.laneSets) {
                neo4jData.relationships.push({
                    $type: 'ContainsElement',
                    source: processObj.id,
                    target: flowElement.id
                })
            }
        })
    }

    bpmnJson.rootElement.rootElements.forEach((rootElement) => {
        if (rootElement.$type === "bpmn:Collaboration") {
            rootElement.participants.forEach((participant) => {
                neo4jData.nodes.push({
                    $type: participant.$type.substring(5),
                    id: participant.id,
                    name: participant.name
                });
                const participantReferences = references.filter((reference) => (
                    reference.element.id === participant.id
                ))
                participantReferences.forEach(participantReference => {
                    neo4jData.relationships.push({
                        $type: 'ContainsProcess',
                        source: participant.id,
                        target: participantReference.id
                    })
                })
            })

            rootElement.messageFlows?.forEach((messageFlow) => {
                handleFlowElement(messageFlow)
            })
        }

        if (rootElement.$type === "bpmn:Process") {
            handleProcess(rootElement);
        }

        rootElement.artifacts?.forEach((artifact) => {
            handleFlowElement(artifact);
        })
    })

    return neo4jData
};

export default formatter;