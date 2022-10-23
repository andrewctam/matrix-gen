import { useRef, useState, useEffect } from 'react'
const useMove = (element, relElement) => {

    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const mouseDown = useRef(false);

    const mouseStartX = useRef(0);
    const mouseStartY = useRef(0);

    const elementStartX = useRef(0);
    const elementStartY = useRef(0);


    const handleMouseDown = (e) => {
        if (!element.current || !element.current.contains(e.target))
            return;

        mouseDown.current = true;
        if (element.current) {
            mouseStartX.current = e.clientX
            mouseStartY.current = e.clientY

            elementStartX.current = parseInt(element.current.style.left)
            elementStartY.current = parseInt(element.current.style.top)
        }
    }

    const handleMouseUp = (e) => {
        mouseDown.current = false;
    }

    const handleMouseMove = (e) => {
        if (mouseDown.current) {
            const newX = elementStartX.current + e.clientX - mouseStartX.current //element start + deltaX
            const newY = elementStartY.current + e.clientY - mouseStartY.current //element start + deltaY

            setX(Math.max(0, Math.min(newX, document.documentElement.clientWidth - element.current.offsetWidth))); //exclude 
            setY(Math.max(0, Math.min(newY, window.innerHeight - element.current.offsetHeight - 31)));
        }
    }

    useEffect(() => {
        if (relElement.current) {
            const rect = relElement.current.getBoundingClientRect();
            setX(rect.left - 10);
            setY(2 * rect.height);
        }
    }, [relElement, relElement.current, element, element.current]) //reset position when opened/closed
    
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