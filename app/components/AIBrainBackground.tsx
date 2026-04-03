'use client'

import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import { useRef, useMemo } from "react"
import * as THREE from "three"

function Particles() {
    const ref = useRef<THREE.Points>(null!)

    const positions = useMemo(() => {
        const arr = new Float32Array(2500 * 3)

        for (let i = 0; i < 2500; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 10
            arr[i * 3 + 1] = (Math.random() - 0.5) * 10
            arr[i * 3 + 2] = (Math.random() - 0.5) * 10
        }

        return arr
    }, [])

    useFrame((state, delta) => {
        if (!ref.current) return

        const { mouse } = state

        // subtle continuous rotation
        ref.current.rotation.y += delta * 0.03

        // target rotation based on cursor
        const targetX = mouse.y * 0.6
        const targetY = mouse.x * 0.6

        // smooth interpolation
        ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.05
        ref.current.rotation.y += (targetY - ref.current.rotation.y) * 0.05
    })

    return (
        <Points ref={ref} positions={positions} stride={3}>
            <PointMaterial
                transparent
                color="#7aa2ff"
                size={0.04}
                sizeAttenuation
                depthWrite={false}
            />
        </Points>
    )
}

export default function AIBrainBackground() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5] }}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%"
            }}

        >
            <Particles />
        </Canvas>
    )
}