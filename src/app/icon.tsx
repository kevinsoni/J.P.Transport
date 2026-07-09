import { ImageResponse } from 'next/og'

// Generates the browser-tab favicon: a blue rounded square with "JP".
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: 'white',
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: -1,
          borderRadius: 7,
        }}
      >
        JP
      </div>
    ),
    { ...size }
  )
}
