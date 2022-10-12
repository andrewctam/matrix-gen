import { useEffect, useRef } from "react";

const useExpand = (scrollToRef) => {
    const expandRef = useRef(null);

    useEffect(() => {
        //auto pads the body and scrolls to the specified ref
        document.body.style.paddingBottom = (expandRef.current.offsetHeight + 10) + "px";
        scrollToRef.current.scrollIntoView(true, {behavior: "smooth", block: "end", inline: "nearest"});


        return () => {
            document.body.style.paddingBottom = "48px";
            //undo the expand
        }
    }, [expandRef, scrollToRef])

    return expandRef;
}


export default useExpand;
