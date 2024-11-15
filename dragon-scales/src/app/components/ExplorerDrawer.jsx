"use client";

// TODO: Ensure only one item is selected at a time across all trees.

import { useEffect, useState, useContext } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Drawer,
  Divider,
  Accordion,
  AccordionDetails,
  IconButton,
  AccordionSummary,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AddIcon from "@mui/icons-material/Add";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";

import { ExplorerContext } from "../contexts/explorerContext";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { getEntity } from "@/app/utils";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";

const drawerWidth = 240;

// Helper to fetch library structure
async function getLibraryStructure(id) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities?ID=${id}`
  );
  return await res.json();
}

// Helper to create tree structure for items
// The first item sent to this function will not be included in the return
function createTreeStructure(item) {
  if (!item.children || item.children.length === 0) return [];
  return item.children.map((child) => ({
    id: child.id,
    label: child.name,
    children: createTreeStructure(child),
  }));
}

// Styles for the drawer
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1),
  backgroundColor: "#4C9DFC",
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  width: "100%",
  justifyContent: "flex-end",
  padding: theme.spacing(2),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: "white",
  padding: theme.spacing(0.5),
  border: "1px solid white",
  borderRadius: "4px",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "1.25rem",
  },
}));

const DrawerContent = styled("div")(({ theme }) => ({
  width: drawerWidth,
  height: "100%",
  backgroundColor: "#4C9DFC",
  color: "white",
  padding: theme.spacing(0, 2, 2),
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  color: "black",
  boxShadow: "none",
  borderRadius: "4px",
  "&:before": {
    display: "none",
  },
  "& .MuiAccordionSummary-root": {
    padding: theme.spacing(0, 1),
    minHeight: 48,
    "& .MuiAccordionSummary-expandIconWrapper": {
      color: "black",
    },
  },
  "& .MuiAccordionDetails-root": {
    padding: theme.spacing(1, 2, 2),
  },
}));

const StyledTreeView = styled(RichTreeView)(({ theme }) => ({
  color: "black",
  "& .MuiTreeItem-content": {
    padding: theme.spacing(0.5, 0),
  },
  "& .MuiTreeItem-label": {
    fontSize: "0.875rem",
  },
}));

export default function ExplorerDrawer({ open, name, id }) {
  const { setDrawerOpen, setCurrentlySelectedItem } = useContext(ExplorerContext);

  const [libraryStructure, setLibraryStructure] = useState([]);
  const [library, setLibrary] = useState({ ID: null, name: null, children: null });
  const [newNotebookDialogOpen, setNewNotebookDialogOpen] = useState(false);
  const [newProjectsDialogStates, setNewProjectsDialogStates] = useState({});
  const [topLevelNotebooks, setTopLevelNotebooks] = useState([]);

  // Opens dialog for creating a new project
  const handleOpenNewProjectsDialog = (childId) => {
    setNewProjectsDialogStates((prevState) => ({
      ...prevState,
      [childId]: true,
    }));
  };

  // Closes the new project dialog
  const handleCloseNewProjectsDialog = (childId) => {
    setNewProjectsDialogStates((prevState) => ({
      ...prevState,
      [childId]: false,
    }));
  };

  const handleOpenNewNotebookDialog = () => {
    setNewNotebookDialogOpen(true);
  };

  const handleCloseNewNotebookDialog = () => {
    setNewNotebookDialogOpen(false);
  };

  // Reload the library structure
  const reloadLibrary = () => {
    getEntity(id).then((data) => {
      setLibrary(JSON.parse(data));
    });
  };

  // initial load 
  useEffect(() => {
    getLibraryStructure(id).then((data) => {
      setLibraryStructure(data);
    });

    getEntity(id).then((data) => {
      setLibrary(JSON.parse(data));
    });
  }, [id]);

  // Load notebooks when the library changes
  useEffect(() => {
    if (library.children) {
      Promise.all(
        library.children.map((child) => getEntity(child))
      ).then((notebooks) => {
        const newTopLevelNotebooks = notebooks.map((t) => JSON.parse(t));
        setTopLevelNotebooks(newTopLevelNotebooks);
      });
    }
  }, [library]);

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          marginLeft: "64px",
          border: "none",
          backgroundColor: "#4C9DFC",
          overflowX: "hidden",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <DrawerHeader>
        <IconContainer>
          <StyledIconButton>
            <SortIcon />
          </StyledIconButton>
          <StyledIconButton>
            <SearchIcon />
          </StyledIconButton>
          <StyledIconButton>
            <AddIcon />
          </StyledIconButton>
          <StyledIconButton onClick={() => setDrawerOpen(false)}>
            <ChevronLeftIcon />
          </StyledIconButton>
        </IconContainer>
      </DrawerHeader>
      <DrawerContent>
        <Typography variant="h4" sx={{ fontWeight: 500, mb: 2 }}>
          <b>{name}</b>
        </Typography>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)", mb: 2 }} />
        <Stack flexGrow={1} spacing={2} flexDirection="column">
          {libraryStructure.children &&
            libraryStructure.children.map((child) => (
              <StyledAccordion key={child.id} TransitionProps={{ timeout: 300 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "#CEE5FF",
                    color: "#005BC7",
                    borderRadius: "4px",
                  }}
                >
                  <Typography>{child.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <StyledTreeView
                    items={createTreeStructure(child)}
                    onItemClick={(event, itemId) =>
                      setCurrentlySelectedItem(itemId)
                    }
                  />
                  <Box>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <IconButton onClick={() => handleOpenNewProjectsDialog(child.id)}>
                        <AddBoxOutlinedIcon sx={{ color: "black" }} />
                      </IconButton>
                    </Box>
                    <NewEntityDialog
                      user="marcos"
                      type="Project"
                      parentName={child.name}
                      parentID={child.id}
                      open={newProjectsDialogStates[child.id] || false}
                      onClose={() => handleCloseNewProjectsDialog(child.id)}
                      reloadParent={reloadLibrary}
                    />
                  </Box>
                </AccordionDetails>
              </StyledAccordion>
            ))}
          <Box display="flex" flexDirection="column" alignItems="center">
            <IconButton onClick={handleOpenNewNotebookDialog}>
              <AddBoxOutlinedIcon sx={{ color: "white" }} />
            </IconButton>
          </Box>
        </Stack>
      </DrawerContent>
      {library.name && library.ID && (
        <NewEntityDialog
          user="marcos"
          type="Notebook"
          parentName={library.name}
          parentID={library.ID}
          open={newNotebookDialogOpen}
          onClose={handleCloseNewNotebookDialog}
          reloadParent={reloadLibrary}
        />
      )}
    </Drawer>
  );
}
