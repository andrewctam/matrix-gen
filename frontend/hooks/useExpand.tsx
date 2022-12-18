import { useEffect, useRef } from "react";

const useExpand = () => {
    const expandRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        //pads the body
        if (expandRef.current) {
            document.body.style.paddingBottom = ((expandRef.current as HTMLElement).offsetHeight + 10) + "px";
        }
        return () => {
            document.body.style.paddingBottom = "48px";
            //undo the expand
        }
    }, [expandRef])

    //returns a ref where the expand grabs the height from
    return expandRef;
}


export default useExpand;
