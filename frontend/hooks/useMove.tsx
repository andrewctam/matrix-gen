import React, { useRef, useState, useEffect } from 'react'
const useMove = (element: React.MutableRefObject<HTMLElement | null>, relElement: React.MutableRefObject<HTMLElement | null>) => {

    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const mouseDown = useRef(false);

    const mouseStartX = useRef(0);
    const mouseStartY = useRef(0);

    const elementStartX = useRef(0);
    const elementStartY = useRef(0);


    const handleMouseDown = (e: MouseEvent) => {
        if (!element.current || !(element.current as HTMLElement).contains(e.target as Node))
            return;

        mouseDown.current = true;
        if (element.current) {
            mouseStartX.current = e.clientX
            mouseStartY.current = e.clientY

            elementStartX.current = parseInt((element.current as HTMLElement).style.left)
            elementStartY.current = parseInt((element.current as HTMLElement).style.top)
        }
    }

    const handleMouseUp = (e: MouseEvent) => {
        mouseDown.current = false;
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (mouseDown.current) {
            const newX = elementStartX.current + e.clientX - mouseStartX.current //element start + deltaX
            const newY = elementStartY.current + e.clientY - mouseStartY.current //element start + deltaY

            setX(Math.max(0, Math.min(newX, document.documentElement.clientWidth - (element.current as HTMLElement).offsetWidth))); //exclude 
            setY(Math.max(0, Math.min(newY, window.innerHeight - (element.current as HTMLElement).offsetHeight - 31)));
        }
    }

    useEffect(() => {
        if (relElement.current) {
            const rect = relElement.current.getBoundingClientRect();
            setX(rect.left - 10);
            setY(2 * rect.height);
        }
    }, [relElement, relElement.current]) //initalize position
    
    useEffect(() => {
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        
        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
        }

    }, [handleMouseDown, handleMouseUp, handleMouseMove])

    return [x, y];
}

export default useMove;