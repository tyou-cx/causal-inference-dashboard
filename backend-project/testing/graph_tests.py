from CausalGraph import CausalGraph, CausalNode, CausalEdge
from GroupedCausalGraph import GroupedCausalGraph, GroupedCausalNode, GroupedCausalEdge

# Tests for GroupedCausalGraph

grouped_graph = GroupedCausalGraph()
grouped_graph.add_node(node="GroupA")
grouped_graph.add_node(node="GroupB")
grouped_graph.add_node(node="GroupC")
grouped_graph.add_edge(from_node="GroupA", to_node="GroupB",
                       time_to_effect={'min': 1, 'max': 1})
grouped_graph.add_edge(from_node="GroupC", to_node="GroupB",
                       time_to_effect={'min': 2, 'max': 3})
grouped_graph.add_edge(from_node="GroupA", to_node="GroupC",
                       time_to_effect={'min': 3, 'max': 4})

grouped_graph.getNode()
grouped_graph.getNodes()
grouped_graph.getEdge()
grouped_graph.getGroup()
grouped_graph.getIncomingEdges()
grouped_graph.getOutgoingEdges()
grouped_graph.getParents()

# Tests for CausalGraph

groupA = CausalGraph(parent=grouped_graph.getNode("GroupA"))
groupA.add_node("cat")
groupA.add_node("dog")
groupA.add_node("parrot")
groupA.add_edge("cat", "dog", time_to_effect={'min': 1, 'max': 2})

groupB = CausalGraph(parent=grouped_graph.getNode("GroupB"))
groupB.add_node("zebra")
groupB.add_node("fish")
groupB.add_edge("zebra", "fish", time_to_effect={'min': 2, 'max': 2})

groupC = CausalGraph(parent=grouped_graph.getNode("GroupC"))
groupC.add_node("horse")

grouped_graph.getNode("GroupA").graph = groupA
grouped_graph.getNode("GroupB").graph = groupB
grouped_graph.getNode("GroupC").graph = groupC

print(grouped_graph.getParents(groupA.getNode("dog")))
print(grouped_graph.getParents(groupA.getNode("cat")))
print(grouped_graph.getParents(groupB.getNode("fish")))
print(grouped_graph.getParents(groupC.getNode("horse")))
