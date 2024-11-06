"use client"

import {useEffect, useState, useRef} from "react";
import {Box, Typography} from "@mui/material";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import parse from "html-react-parser";
import {styled} from "@mui/material/styles";
import Tiptap from "@/app/components/TiptapEditor/Tiptap";

const StyledStepContentBlocksTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    cursor: 'default',
}))

const StyledContentBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    '&:hover': {
        backgroundColor: '#b2b8cf',
    }

}))

export default function ActiveStepContentBlock( { contentBlock, entID, activeContentBlockRef, updateContent } ) {

    const [isActive, setActive] = useState(false)

    const contentBlockRef = useRef(null); // used to track active state
    const textRef = useRef(contentBlock.content[contentBlock.content.length - 1]); // used to track editor text

    const handleContentChange = (content) => {
        updateContent(contentBlock.ID, content)
    }

    const activateContentBlock = (event) => {
        setActive(true)
        activeContentBlockRef.current = contentBlock.ID;
    
    }

    const deactivateContentBlock = () => {
        setActive(false)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contentBlockRef.current && !contentBlockRef.current.contains(event.target)) {
                deactivateContentBlock()
            }
        };

        if (isActive) {
            document.addEventListener("click", handleClickOutside)
        }
        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [isActive])

    if (isActive) {
        return (
            <StyledContentBox ref={contentBlockRef}>
                <Box marginRight={2}>
                    <ViewCompactIcon/>
                </Box>
                <Tiptap onContentChange={handleContentChange}
                        entID={entID}
                        initialContent={textRef.current} />
            </StyledContentBox>
        )
    } else {
        return (
            <StyledContentBox onClick={activateContentBlock} ref={contentBlockRef}>
                <Box marginRight={2} cursor="pointer">
                    <ViewCompactIcon cursor="pointer"/>
                </Box>
                <StyledStepContentBlocksTypography key={contentBlock.ID}>
                    {parse(contentBlock.content[contentBlock.content.length - 1])}
                </StyledStepContentBlocksTypography>
            </StyledContentBox>
        )
    }
}















