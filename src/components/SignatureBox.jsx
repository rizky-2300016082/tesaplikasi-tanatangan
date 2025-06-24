// src/components/SignatureBox.jsx
import { useDrag } from 'react-dnd';
import { useEffect, useRef } from 'react';

const SignatureBox = ({ top, left, onMove }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'box',
    item: { top, left },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        const offset = monitor.getDifferenceFromInitialOffset();
        if (offset) {
          const newTop = top + offset.y;
          const newLeft = left + offset.x;
          onMove?.({ top: newTop, left: newLeft });
        }
      }
    }
  }), [top, left]);

  drag(ref);

  return (
    <div
      ref={ref}
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
        zIndex: 100,
      }}
    />
  );
};

export default SignatureBox;
