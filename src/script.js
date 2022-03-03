import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

let raycaster, Intersected
let avatarModel
let avatarHead, avatarLeftEye, avatarRightEye, avatarSpine, avatarBreathing, raycastHead
let bloomComposer

const pointer = new THREE.Vector2();

let hasLoaded = false

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1
scene.add(camera)

document.addEventListener( 'mousemove', onMouseMove )

// Cursor
function onMouseMove(event)
{
    event.preventDefault()
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1
}

// // Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        hasLoaded = true
    }
)

// Models
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.load(
    'models/avatar.glb', (glb) => 
    {
        avatarModel = glb
        console.log(avatarModel)
        avatarModel.scene.position.set(1, -0.7, 0.5)
        avatarModel.scene.traverse(function(child) {
            if (child.name === "Head") {
              avatarHead = child
            }
            if (child.name === "LeftEye") {
                avatarLeftEye = child
            }
            if (child.name === "RightEye") {
                avatarRightEye = child
            }
            if (child.name === "Spine2") {
                avatarSpine = child
            }
            if (child.name === "Spine1") {
                avatarSpine = child
            }
            if (child.name === "Wolf3D_Head") {
                raycastHead = child
            }
        })
        scene.add(avatarModel.scene)
    }
)


const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
directionalLight.castShadow = true
directionalLight.position.set(0, 0.5, 0)
scene.add(directionalLight)

const sphere = new THREE.SphereGeometry( 0.5, 32, 32 )
const light1 = new THREE.PointLight( 0xff0040, 2, 5 )
light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) )
light1.position.set(1, 0.5, -2)
light1.scale.set(2,2,2)
scene.add( light1 )

const sphere2 = new THREE.SphereGeometry( 1, 32, 32 )
const light2 = new THREE.PointLight( 0x9514ff, 3, 10 )
light2.add( new THREE.Mesh( sphere2, new THREE.MeshBasicMaterial( { color: 0x9514ff } ) ) )
light2.position.set(0, 1, -1)
light2.scale.set(0.2,0.2,0.2)
scene.add( light2 )

const sphere3 = new THREE.SphereGeometry( 1, 32, 32 )
const light3 = new THREE.PointLight( 0xff14c0, 3, 10 )
light3.add( new THREE.Mesh( sphere3, new THREE.MeshBasicMaterial( { color: 0xff14c0 } ) ) )
light3.position.set(2, 1, -1)
light3.scale.set(0.2,0.2,0.2)
scene.add( light3 )

const sphere4 = new THREE.SphereGeometry( 1, 32, 32 )
const light4 = new THREE.PointLight( 0x146eff, 3, 10 )
light4.add( new THREE.Mesh( sphere4, new THREE.MeshBasicMaterial( { color: 0x146eff } ) ) )
light4.position.set(1, 2, -1)
light4.scale.set(0.2,0.2,0.2)
scene.add( light4 )

raycaster = new THREE.Raycaster();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    transparent: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const renderTarget = new THREE.WebGLMultisampleRenderTarget(
    sizes.width,
    sizes.height,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
    }
)

const renderScene = new RenderPass( scene, camera )

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )
bloomPass.threshold = 1
bloomPass.strength = 0.5
bloomPass.radius = 10

bloomComposer = new EffectComposer( renderer, renderTarget )
bloomComposer.setSize(sizes.width, sizes.height)
bloomComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
bloomComposer.addPass( renderScene )
bloomComposer.addPass( bloomPass )

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    const parallaxX = pointer.x * 0.5
    const parallaxY = - pointer.y * 0.5

    if (hasLoaded) {
        avatarHead.rotation.y += ((parallaxX / 2) - avatarHead.rotation.y) * 2 * deltaTime
        avatarHead.rotation.x += (( parallaxY / 2 ) - avatarHead.rotation.x) * 2 * deltaTime

        avatarSpine.rotation.y += ((parallaxX / 2) - avatarSpine.rotation.y) * 2 * deltaTime
        avatarSpine.rotation.x += (( parallaxY / 2 ) - avatarSpine.rotation.x) * 2 * deltaTime

        avatarLeftEye.rotation.y += ((parallaxX / 1.5) - avatarLeftEye.rotation.y) * 2 * deltaTime
        avatarLeftEye.rotation.x += (( parallaxY / 1.5 ) - avatarLeftEye.rotation.x) * 2 * deltaTime

        avatarRightEye.rotation.y += ((parallaxX / 1.5) - avatarRightEye.rotation.y) * 2 * deltaTime
        avatarRightEye.rotation.x += (( parallaxY / 1.5) - avatarRightEye.rotation.x) * 2 * deltaTime
    }

    raycaster.setFromCamera( pointer, camera )

    if (hasLoaded) {
        const intersection = raycaster.intersectObject( raycastHead );

        if ( intersection.length > 0 ) {
            const instanceId = intersection[ 0 ].instanceId;
            console.log(instanceId)
        }
    }

    // Render
    renderer.render(scene, camera)
    bloomComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()