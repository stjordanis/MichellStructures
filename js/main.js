/**
 * Created by ghassaei on 9/16/16.
 */


$(function() {

    initThreeJS();

    var _h = 20;
    var _L = 30;
    var _n = 3;
    var _P = new THREE.Vector3(0,0,0);

    var supportVect = new THREE.Vector3(0, _h/2, 0);

    //storage for nodes and beams
    var displayNodes = [];
    var displayBeams = [];

    var _nodes = solveMichell(_L, _n);
    plotNodes(_nodes, _n);

    function solveMichell(L, n) {//L = length, layers = number of layers

        if (n<1){
            console.log("n is < 1");
            return [];
        }
        if (n==1){
            return [[new THREE.Vector3(L,0,0)]];
        }
        var nodes = [];

        var gamma = Math.PI/4;

        var lastLayer = [solveForMiddleVertex(supportVect, gamma)];
        nodes.push(lastLayer);

        for (var layer=2;layer<=n;layer++){

            var nextLayer = [];
            nextLayer.push(solveForThirdVertex(lastLayer[0], supportVect, gamma));

            for (var num=1;num<layer;num++){
                if (nextLayer.length+1 == layer){
                    nextLayer.push(solveForMiddleVertex(nextLayer[nextLayer.length-1], gamma));
                } else {
                    nextLayer.push(solveForThirdVertex(lastLayer[num], lastLayer[num-1], gamma/2));
                }
            }

            lastLayer = nextLayer;
            nodes.push(nextLayer);
        }
        return nodes;

    }

    function solveForMiddleVertex(v1, _gamma){//angle between them is gamma
        return new THREE.Vector3(v1.y*(1/Math.tan(_gamma/2)), 0, 0);
    }

    function solveForThirdVertex(v1, v2, _gamma){//angle between them is gamma
        var d = v1.clone().sub(v2).length();
        var a = d/Math.tan(_gamma);
        var rot = Math.PI/2+Math.atan2(v1.y-v2.y, v1.x-v2.x);
        return (new THREE.Vector3(a*Math.cos(rot), a*Math.sin(rot), 0)).add(v1);
    }

    //function numNodesForN(n, val){
    //    if (val=== undefined) val = 0;
    //    val += n;
    //    if (n==1) return val;
    //    return numNodesForN(n-1, val);
    //}

    function plotNodes(nodes, n){

        for (var i=0;i<displayNodes.length;i++){
            displayNodes[i].destroy();
        }
        for (var i=0;i<displayBeams.length;i++){
            displayBeams[i].destroy();
        }
        displayNodes = [];
        displayBeams = [];

        var support = new Node(supportVect);
        var supportMirror = new Node(supportVect, true);
        displayNodes.push(support);
        displayNodes.push(supportMirror);

        var lastLayerNodes = [];
        var lastLayerNodesMirror = [];

        for (var i=0;i<n;i++){//for each layer

            var layerVertices = nodes[i];

            var lastNode = support;
            var lastNodeMirror = supportMirror;

            for (var j=0;j<layerVertices.length;j++){//for each node on each layer
                var nextNode = new Node(layerVertices[j]);
                displayNodes.push(nextNode);
                new Beam([lastNode.getPosition(), nextNode.getPosition()]);

                var nextNodeMirror = new Node(layerVertices[j], true);
                displayNodes.push(nextNodeMirror);
                new Beam([lastNodeMirror.getPosition(), nextNodeMirror.getPosition()]);

                if (i>0 && lastLayerNodes.length>j) {
                    new Beam([lastLayerNodes[j].getPosition(), nextNode.getPosition()]);
                    new Beam([lastLayerNodesMirror[j].getPosition(), nextNodeMirror.getPosition()]);
                }

                if (lastLayerNodes.length>j) lastLayerNodes[j] = nextNode;
                else lastLayerNodes.push(nextNode);
                if (lastLayerNodesMirror.length>j) lastLayerNodesMirror[j] = nextNodeMirror;
                else lastLayerNodesMirror.push(nextNodeMirror);

                lastNode = nextNode;
                lastNodeMirror = nextNodeMirror;
            }
        }

        render();
    }

});
