import { Box, BoxProps, Skeleton } from "@mui/material"
import { PropsWithChildren, createContext, useContext } from "react"

const SkeletonContext = createContext(true)

export function SkeletonProvider({
  loading,
  children
}: PropsWithChildren<{ loading: boolean }>) {
  return (
    <SkeletonContext.Provider value={loading}>
      {children}
    </SkeletonContext.Provider>
  )
}

export function TextSkeleton({
  children,
  ...props
}: PropsWithChildren<BoxProps>) {
  const loading = useContext(SkeletonContext)
  return <Box {...props}>{loading ? <Skeleton /> : children}</Box>
}
