import { useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function ThreeMeshWorld() {
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>('.scene-stage'); if (!stage || typeof WebGLRenderingContext === 'undefined') return
    const canvas = document.createElement('canvas'); canvas.className = 'three-layer'; canvas.setAttribute('aria-label', '3D mesh world'); stage.prepend(canvas)
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }) } catch { canvas.remove(); return }
    const scene = new THREE.Scene(); const world = new THREE.Group(); scene.add(world); const relationGroup = new THREE.Group(); scene.add(relationGroup)
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100); camera.position.set(0, 5.4, 10); camera.lookAt(0, 0, 0)
    const controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.enablePan = true; controls.minDistance = 5; controls.maxDistance = 18; controls.target.set(0, 0, 0)
    scene.add(new THREE.HemisphereLight(0x9edbd8, 0x081019, 1.8)); const key = new THREE.DirectionalLight(0x7fe1d0, 2.5); key.position.set(-4, 8, 5); scene.add(key)
    const material = (color: number) => new THREE.MeshStandardMaterial({ color, metalness: .35, roughness: .48 })
    const pickable = new globalThis.Map<string, THREE.Group>()
    const sync = (event: Event) => { world.clear(); pickable.clear(); const items = (event as CustomEvent<{ id: string; kind: string; x?: number; z?: number }[]>).detail ?? []; items.forEach((item, index) => { const group = new THREE.Group(); const color = item.kind === 'database' ? 0x9b4552 : item.kind === 'app-server' ? 0x9b7835 : item.kind === 'replica' ? 0x3a8277 : item.kind === 'shard' ? 0x847034 : 0x34758a; const mesh = new THREE.Mesh(item.kind === 'replica' ? new THREE.CylinderGeometry(.3, .3, .2, 16) : item.kind === 'client' ? new THREE.BoxGeometry(.9, .45, .18) : new THREE.BoxGeometry(.7, .7, .55), material(color)); mesh.position.y = .15; group.add(mesh); group.position.set(item.x ?? (-2.2 + (index % 4) * 1.4), -.7, item.z ?? (1.5 + Math.floor(index / 4) * .8)); group.userData.instanceId = item.id; world.add(group); pickable.set(item.id, group) }) }
    const syncRelations = (event: Event) => { relationGroup.clear(); const items = (event as CustomEvent<{ source: string; target: string; type: string }[]>).detail ?? []; items.forEach((item) => { const a = pickable.get(item.source)?.position; const b = pickable.get(item.target)?.position; if (!a || !b) return; const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a.clone(), b.clone()]), new THREE.LineBasicMaterial({ color: 0x8ff0d2 })); line.userData.type = item.type; relationGroup.add(line) }) }
    const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let down = { x: 0, y: 0 }; let meshGesture = false
    const pointerDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY }; const rect = canvas.getBoundingClientRect(); pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1); raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(world.children, true)[0]; const group = hit?.object.parent; const id = group?.userData.instanceId as string | undefined; meshGesture = Boolean(id); if (id) { controls.enabled = false; window.dispatchEvent(new CustomEvent('architecture:select', { detail: id })) } }
    const pointerUp = (_event: PointerEvent) => { controls.enabled = true; meshGesture = false }
    const connectAt = (event: Event) => { const { source, x, y } = (event as CustomEvent<{ source: string; x: number; y: number }>).detail; const rect = canvas.getBoundingClientRect(); if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return; pointer.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1); raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(world.children, true)[0]; const target = hit?.object.parent?.userData.instanceId as string | undefined; if (target && target !== source) window.dispatchEvent(new CustomEvent('architecture:connect', { detail: { source, target } })) }
    const resize = () => { const rect = stage.getBoundingClientRect(); renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false); camera.aspect = rect.width / Math.max(1, rect.height); camera.updateProjectionMatrix() }; resize()
    window.addEventListener('architecture:instances', sync); window.addEventListener('architecture:relations', syncRelations); window.addEventListener('architecture:connect-at', connectAt); canvas.addEventListener('pointerdown', pointerDown, true); canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointercancel', pointerUp); window.addEventListener('resize', resize)
    let frame = 0; const animate = () => { frame = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera) }; animate()
    return () => { cancelAnimationFrame(frame); controls.dispose(); renderer.dispose(); canvas.remove(); window.removeEventListener('architecture:instances', sync); window.removeEventListener('architecture:relations', syncRelations); window.removeEventListener('architecture:connect-at', connectAt); canvas.removeEventListener('pointerdown', pointerDown, true); canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointercancel', pointerUp); window.removeEventListener('resize', resize) }
  }, [])
  return null
}
