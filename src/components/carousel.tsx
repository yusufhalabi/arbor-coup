"use client"

import { memo, useEffect, useLayoutEffect, useMemo, useState } from "react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion"

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === "undefined"

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  })

  const handleChange = () => {
    setMatches(getMatches(query))
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()

    matchMedia.addEventListener("change", handleChange)

    return () => {
      matchMedia.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

const keywords = [
  "night",
  "city",
  "sky",
  "sunset",
  "sunrise",
  "winter",
  "skyscraper",
  "building",
  "cityscape",
  "architecture",
  "street",
  "lights",
  "downtown",
  "bridge",
]

const duration = 0.15
const transition = { duration, ease: [0.32, 0.72, 0, 1], filter: "blur(4px)" }
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] }

const ROTATION_SPEED = 0.2; // This constant can stay outside

const Carousel = memo(
  ({
    controls,
    cards,
    isCarouselActive,
  }: {
    controls: any
    cards: string[]
    isCarouselActive: boolean
  }) => {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)")
    const cylinderWidth = isScreenSizeSm ? '100vw' : '150vw'
    const faceCount = cards.length
    const faceWidth = `calc(${cylinderWidth} / ${faceCount})`
    const radius = `calc(${cylinderWidth} / ${2 * Math.PI})`
    const rotation = useMotionValue(0)
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`
    )

    useEffect(() => {
      let animationFrameId: number;
      
      const animate = () => {
        if (isCarouselActive) {
          rotation.set(rotation.get() + ROTATION_SPEED);
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
      
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [isCarouselActive, rotation]);

    return (
      <div
        className="flex h-full items-center justify-center bg-transparent"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.div
          className="relative flex h-full origin-center justify-center"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          animate={controls}
        >
          {cards.map((imgUrl, i) => (
            <motion.div
              key={`key-${imgUrl}-${i}`}
              className="absolute flex h-full origin-center items-center justify-center rounded-xl p-2 pointer-events-none"
              style={{
                width: faceWidth,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius})`,
              }}
            >
              <motion.img
                src={imgUrl}
                alt={`carousel-${i}`}
                className="rounded-xl object-cover aspect-square 
                         sm:w-[20vh] sm:h-[20vh]
                         md:w-[25vh] md:h-[25vh]
                         lg:w-[30vh] lg:h-[30vh]" 
                initial={{ filter: "blur(4px)" }}
                animate={{ filter: "blur(0px)" }}
                transition={transition}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }
)

function ThreeDPhotoCarousel() {
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()
  
  const imageUrls = [
    "/images/carousel/1.jpg",
    "/images/carousel/2.jpg",
    "/images/carousel/3.jpg",
    "/images/carousel/4.jpg",
    "/images/carousel/5.jpg",
    "/images/carousel/6.jpg",
    "/images/carousel/7.jpg",
    "/images/carousel/8.jpg",
    "/images/carousel/9.jpg",
    "/images/carousel/10.jpg",
  ]

  return (
    <motion.div layout className="relative pointer-events-none">
      <div className="relative h-[80vh] w-full overflow-hidden">
        <Carousel
          controls={controls}
          cards={imageUrls}
          isCarouselActive={isCarouselActive}
        />
      </div>
    </motion.div>
  )
}

export { ThreeDPhotoCarousel };
