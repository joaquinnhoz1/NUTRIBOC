export function Avocado({ size = 108 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M50 8c14 0 24 12 24 30 0 24-13 46-24 46S26 62 26 38C26 20 36 8 50 8Z" fill="#A9C08A" />
      <path d="M50 20c9 0 15 8 15 21 0 18-9 33-15 33s-15-15-15-33c0-13 6-21 15-21Z" fill="#F2EFD9" />
      <ellipse cx="50" cy="48" rx="11" ry="12" fill="#9A6B3E" />
    </svg>
  )
}

export function Leaf({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M50 90C50 60 50 30 50 14" stroke="#7C8B58" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 40C50 26 60 16 78 14 78 32 68 42 50 40Z" fill="#9DB073" />
      <path d="M50 58C50 44 40 34 22 32 22 50 32 60 50 58Z" fill="#8BA063" />
      <path d="M50 26C50 16 57 9 70 8 70 21 63 27 50 26Z" fill="#AEC084" />
    </svg>
  )
}

export function Kiwi({ size = 92 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="42" fill="#8A6B3C" />
      <circle cx="50" cy="50" r="36" fill="#A7C07A" />
      <circle cx="50" cy="50" r="12" fill="#F2EFD9" />
      <g fill="#3A4A28">
        <circle cx="50" cy="26" r="2" />
        <circle cx="62" cy="30" r="2" />
        <circle cx="71" cy="40" r="2" />
        <circle cx="74" cy="52" r="2" />
        <circle cx="70" cy="64" r="2" />
        <circle cx="61" cy="71" r="2" />
        <circle cx="50" cy="74" r="2" />
        <circle cx="39" cy="71" r="2" />
        <circle cx="30" cy="64" r="2" />
        <circle cx="26" cy="52" r="2" />
        <circle cx="29" cy="40" r="2" />
        <circle cx="38" cy="30" r="2" />
      </g>
    </svg>
  )
}

export function Apple({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path
        d="M50 30c-8-7-22-6-27 4-6 12 1 35 12 47 5 5 10 5 15 2 5 3 10 3 15-2 11-12 18-35 12-47-5-10-19-11-27-4Z"
        fill="#C58B6A"
      />
      <path
        d="M50 30c-8-7-22-6-27 4-3 6-2 16 2 26 4-10 13-22 25-30Z"
        fill="#D49C7A"
      />
      <path d="M50 30c2-9 9-15 19-15-1 9-8 15-19 15Z" fill="#8BA063" />
      <path d="M50 18c0-5-2-9-2-9" stroke="#7C5A3C" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Lemon({ size = 82 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="50" rx="38" ry="30" transform="rotate(-30 50 50)" fill="#E3CE7C" />
      <ellipse cx="50" cy="50" rx="30" ry="22" transform="rotate(-30 50 50)" fill="#EEDD95" />
      <path d="M78 30c6-6 10-7 10-7" stroke="#8BA063" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function OrangeSlice({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="40" fill="#D89A5B" />
      <circle cx="50" cy="50" r="34" fill="#F0C58A" />
      <g stroke="#D89A5B" strokeWidth="2">
        <path d="M50 50 50 16" />
        <path d="M50 50 78 32" />
        <path d="M50 50 84 50" />
        <path d="M50 50 78 68" />
        <path d="M50 50 50 84" />
        <path d="M50 50 22 68" />
        <path d="M50 50 16 50" />
        <path d="M50 50 22 32" />
      </g>
    </svg>
  )
}
