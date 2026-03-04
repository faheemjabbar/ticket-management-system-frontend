interface DottedBackgroundProps {
  opacity?: string;
  size?: string;
}

const DottedBackground = ({ opacity = "opacity-[0.1]", size = "150px" }: DottedBackgroundProps) => (
  <div 
    className={`absolute inset-0 ${opacity} pointer-events-none z-0`}
    style={{ 
      backgroundImage: 'url("/dotted.jpg")', 
      backgroundRepeat: 'repeat',
      backgroundSize: size,
    }}
  />
);

export default DottedBackground;
