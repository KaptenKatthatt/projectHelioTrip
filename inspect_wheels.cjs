const fs = require('fs');

const buffer = fs.readFileSync('./public/Mars 2020 Perseverance Rover.glb');
const jsonChunkLength = buffer.readUInt32LE(12);
const jsonBuffer = buffer.slice(20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonBuffer.toString('utf8'));

const wheelsNode = gltf.nodes.find(n => n.name === 'Wheels_objs');
console.log('Wheels node:', wheelsNode);

if (wheelsNode && wheelsNode.mesh !== undefined) {
  const mesh = gltf.meshes[wheelsNode.mesh];
  console.log('Wheels mesh:', mesh);
  mesh.primitives.forEach(p => {
    console.log('Material index:', p.material);
    console.log('Material:', gltf.materials[p.material]);
  });
}
