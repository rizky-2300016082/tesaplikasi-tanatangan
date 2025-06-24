// src/components/SignatureBox.jsx
import { useDrag } from 'react-dnd';

const SignatureBox = ({ top, left }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'box', // Tipe item, kita sederhanakan
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), []);

  return (
    <div
      ref={drag}
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        height: '50px',
        width: '150px',
        border: '2px dashed #e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        cursor: 'move',
        opacity: isDragging ? 0.4 : 1,
        zIndex: 100, // Pastikan selalu di atas
      }}
    />
  );
};

export default SignatureBox;