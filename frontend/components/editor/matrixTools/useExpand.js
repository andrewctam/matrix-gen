import { useEffect, useRef } from "react";

const useExpand = (scrollToRef) => {
    const expandRef = useRef(null);

    useEffect(() => {
        //auto pads the body and scrolls to the specified ref
        document.body.style.paddingBottom = expandRef.current.offsetHeight + "px";
        scrollToRef.current.scrollIntoView(true, {behavior: "smooth", block: "end", inline: "nearest"});


        return () => {
            document.body.style.paddingBottom = "0px";
            //undo the expand
        }
    }, [expandRef])

    return expandRef;
}


export default useExpand;
