import { SvgIcon, SvgIconProps } from "@mui/material"

export function CircleIcon({
  filled,
  ...props
}: SvgIconProps & { filled?: boolean }) {
  return (
    <SvgIcon {...props}>
      {filled ? (
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
      ) : (
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
      )}
    </SvgIcon>
  )
}
