const fs = require('fs');

const buffer = fs.readFileSync('./public/Mars 2020 Perseverance Rover.glb');
const magic = buffer.toString('utf8', 0, 4);
if (magic !== 'glTF') {
  console.log('Not a glb');
  process.exit(1);
}

const jsonChunkLength = buffer.readUInt32LE(12);
const jsonChunkType = buffer.toString('utf8', 16, 20);

if (jsonChunkType !== 'JSON') {
  console.log('No JSON chunk');
  process.exit(1);
}

const jsonBuffer = buffer.slice(20, 20 + jsonChunkLength);
const jsonStr = jsonBuffer.toString('utf8');
const gltf = JSON.parse(jsonStr);

gltf.nodes.forEach((node, idx) => {
  if (node.name && (node.name.toLowerCase().includes('wheel') || node.name.toLowerCase().includes('tire') || node.name.toLowerCase().includes('cylinder'))) {
    console.log(`Node ${idx}: ${node.name} (mesh: ${node.mesh !== undefined})`);
  }
});

console.log('All mesh nodes:');
gltf.nodes.forEach((node, idx) => {
  if (node.mesh !== undefined) {
    console.log(`Node ${idx}: ${node.name}`);
  }
});
