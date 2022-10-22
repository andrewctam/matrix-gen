import { useEffect, useRef } from "react";

const useExpand = () => {
    const expandRef = useRef(null);

    useEffect(() => {
        //pads the body
        document.body.style.paddingBottom = (expandRef.current.offsetHeight + 10) + "px";

        return () => {
            document.body.style.paddingBottom = "48px";
            //undo the expand
        }
    }, [expandRef])

    //returns a ref where the expand grabs the height from
    return expandRef;
}


export default useExpand;
