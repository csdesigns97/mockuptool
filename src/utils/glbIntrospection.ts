import * as THREE from "three";

export function findObjectByName(root: THREE.Object3D, name: string): THREE.Object3D | undefined {
  let found: THREE.Object3D | undefined;
  root.traverse((child) => {
    if (!found && child.name === name) found = child;
  });
  return found;
}

/**
 * Finds the node with the given name and returns it if it's a mesh, or
 * otherwise the first mesh among its descendants. Needed because Blender's
 * glTF exporter wraps a mesh node in a plain Group (named after the Blender
 * object) whenever that object has child nodes — as is the case for
 * Krant-Rechtopstaand, which has the empty "Normaal"/"Weekend" markers as
 * children, so the actual THREE.Mesh ends up named after its own mesh data
 * ("Plane"), not the object name we look up by.
 */
export function findMeshByName(root: THREE.Object3D, name: string): THREE.Mesh | undefined {
  const obj = findObjectByName(root, name);
  if (!obj) return undefined;
  if (obj instanceof THREE.Mesh) return obj;
  let found: THREE.Mesh | undefined;
  obj.traverse((child) => {
    if (!found && child instanceof THREE.Mesh) found = child;
  });
  return found;
}

export function boundingBoxOf(object: THREE.Object3D): THREE.Box3 {
  return new THREE.Box3().setFromObject(object);
}

export function boundingSphereOf(object: THREE.Object3D): THREE.Sphere {
  const box = boundingBoxOf(object);
  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);
  return sphere;
}

/** Standard material as authored by the Blender glTF export; false if a different material type slipped through. */
export function asStandardMaterial(material: THREE.Material | THREE.Material[]): THREE.MeshStandardMaterial | undefined {
  const m = Array.isArray(material) ? material[0] : material;
  return m instanceof THREE.MeshStandardMaterial ? m : undefined;
}
