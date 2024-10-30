"use client";

import React, { FormEvent, useRef, useState } from "react";
import OpenAI from "openai";
import { Avatar, AppBar, Button, Toolbar, IconButton, Typography, Dialog, DialogContent, DialogActions, DialogTitle, Drawer, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Backdrop, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import PaletteIcon from '@mui/icons-material/Palette';
import AddPhotoIcon from '@mui/icons-material/AddAPhoto';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CancelIcon from '@mui/icons-material/Cancel';

import CloseIcon from '@mui/icons-material/Close';
import { Card } from "@aws-amplify/ui-react";
import { generateRecipe } from "./actions";
import { newlineToParagaph, newlineToWysiwygData } from './utils';
import ReactGridLayout from './react-grid-layout';
import WysiwygEditor from './components/wysiwyg-editor';

import './styles/app.css';

const key = process.env.NEXT_PUBLIC_NEXT_OPENAI_API_KEY;

const dallEImageSizes = ["1024x1024", "1024x1792", "1792x1024"];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  }
}));

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dialog, setDialog] = useState('');

  const handleClickOpen = () => {
    setDialog('');
  };

  const handleClose = () => {
    setDialog('');
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const openai = new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true
  });

  const gridLayoutRef = useRef<any>();
  const [result, setResult] = useState<string>("");
  const [loading, setloading] = useState(false);
  const [logo, setLogo] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);


  function displayImage(image:string, isLogo:Boolean = false) {
  
    const imageMarkup = (
          <img src={`${image}`} className="img-fluid" alt="Placeholder Image" />
    );

    if (image && imageMarkup) {
      gridLayoutRef?.current?.addWidget(imageMarkup);
    }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setloading(true);
    setDialog('');
    event.preventDefault();

    try {
      const formData = new FormData(event.currentTarget);
      debugger;
      const data = await generateRecipe(formData);
      const recipe = typeof data === "string" ? data : "No data returned";
      setloading(false);
      setResult(recipe);
    } catch (e) {
      alert(`An error occurred: ${e}`);
    }
  };

  const fetchImage = async (prompt:string, API_KEY:string, imageSize:string =  "1024x1024", isLogo:Boolean = false) => {
    const url = "https://api.openai.com/v1/images/generations";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: isLogo ? `Business Logo for ${prompt}` : `${prompt}`,
        n: 1,
        size: imageSize,
      }),
    };
  
    try {
      setShowSpinner(true);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = await response.json();
        const message = error.error.message ? error.error.message : "Failed to fetch image";
        return;
      }
  
      const result = await response.json();
      const imageUrl = result.data[0].url;


      setShowSpinner(false);
      if (imageUrl && typeof imageUrl === 'string') {
        displayImage(imageUrl, true);
      }
    } catch (error) {
      setShowSpinner(false);
      console.warn("There was an error, please try again");
    } finally {
      setShowSpinner(false);
    }
  };
  

  const onCreateLogo = async function (event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDialog('');    
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get("prompt")?.toString();
    const imageSize = formData.get("imageSize")?.toString();

    if (prompt && typeof prompt === 'string') {
      fetchImage(prompt, key, imageSize, true);
    }
  };

  const onGenerateImage = async function (event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDialog('');    
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get("prompt")?.toString();
    const imageSize = formData.get("imageSize")?.toString();

    if (prompt && typeof prompt === 'string') {
      fetchImage(prompt, key, imageSize, false);
    }
  };

  const askOpenAI = async (prompt:string) => {
    try {
      setShowSpinner(true);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { "role": "user", "content": `Please send me some marketing content for my website: ${prompt}` }
        ]
      });

      const text = completion.choices.reduce((acc, next) => {
        if (next?.message?.content && typeof next?.message?.content === 'string') { 
          acc = acc.concat(next?.message?.content);
        } return acc; }, '');

      const formattedText = newlineToParagaph(text);
      const formattedJSON = newlineToWysiwygData(text);

      gridLayoutRef?.current?.addWidget(<WysiwygEditor initialValue={formattedJSON} />);

      setShowSpinner(false);

      } catch (error) {
        setShowSpinner(false);
      }

};

  const onAddContentBlock = async function (event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDialog('');    
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get("prompt")?.toString();

    if (prompt && typeof prompt === 'string') {
      askOpenAI(prompt);
    }
  };

  const addWysiwygEditor = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDrawerOpen(!isDrawerOpen);
    if (gridLayoutRef?.current) {
      gridLayoutRef?.current?.addWidget(<WysiwygEditor initialValue={[{
        type: 'paragraph',
        children: [
            { text: 'Edit your content here' },
        ]
    }]} />);
    }
  };

  const openDialog = (title:string) => {
    setIsDrawerOpen(false);
    setDialog(title);
  }
  

  return (
    <>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={Boolean(dialog)}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          {dialog}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
          <div className="controls">
            {dialog === 'Create Logo' && (
              <form id="generate-form" onSubmit={onCreateLogo} className=" p-4 flex flex-col gap-1  max-w-full mx-auto">
                <DialogContent sx={{ paddingLeft: 0, paddingRight: 0 }}>
                  <textarea
                    id="prompt"
                    name="prompt"
                    className="border border-black  text-gray-900 p-4 rounded-lg max-w-full w-full text-xl "
                    placeholder="Enter your business name"
                  />
                  <label>Image Size</label>
                  <select id="image-size" name="imageSize">
                    {dallEImageSizes.map((size, i) => 
                        <option value={size}>{size}</option>
                    )}
                  </select>
                </DialogContent>
                <DialogActions>
                  <button
                    type="submit"
                    id="generate"
                    className="text-white p-2 rounded-lg bg-blue-500 w-1/2 text-xl"
                  >
                    Generate Logo
                  </button>
                </DialogActions>
              </form>
            )}
            {dialog === 'Create Image' && (
              <form id="generate-image-form" onSubmit={onGenerateImage} className=" p-4 flex flex-col gap-1  max-w-full mx-auto">
                <DialogContent  sx={{ paddingLeft: 0, paddingRight: 0 }}>
                  <textarea
                    id="prompt"
                    name="prompt"
                    className="border border-black  text-gray-900 p-4 rounded-lg max-w-full w-full text-xl "
                    placeholder="Ask AI for any kind of image"
                  />
                  <label>Image Size</label>
                  <select id="image-size" name="imageSize">
                    {dallEImageSizes.map((size, i) => 
                        <option value={size}>{size}</option>
                    )}
                  </select>
                </DialogContent>
                <DialogActions>
                  <button
                    type="submit"
                    id="generate"
                    className="text-white p-2 rounded-lg bg-blue-500 w-1/2 text-xl"
                  >
                    Create Image
                  </button>
                </DialogActions>
              </form>
            )}
            {dialog === 'Have AI Generate Your Content' && (
              <form id="generate-content-form" onSubmit={onAddContentBlock} className=" p-4 flex flex-col gap-1  max-w-full mx-auto">
                <DialogContent  sx={{ paddingLeft: 0, paddingRight: 0 }}>
                  <textarea
                    id="prompt"
                    name="prompt"
                    className="border border-black  text-gray-900 p-4 rounded-lg max-w-full w-full text-xl "
                    placeholder="Enter the type of content you need for your website"
                  />
                </DialogContent>
                <DialogActions>
                  <button
                    type="submit"
                    id="generate"
                    className="text-white p-2 rounded-lg bg-blue-500 w-1/2 text-xl"
                  >
                    Generate Content
                  </button>
                </DialogActions>
              </form>
            )}            
          </div>          
      </BootstrapDialog>    
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ alignItems: 'center', display: 'flex', flexGrow: 1, justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', margin: '0 15px' }}>
              <img src="https://images.ctfassets.net/t21gix3kzulv/391zRXYpuZ902MDK4sLU9D/083de29c6366c3647732c962f377aa15/CTCT_Logo_H_White_RGB.svg" className="object-scale-down" style={{ maxHeight: 40 }} />
            </div>
            <span style={{ color: '#fff' }}>AI Page Builder</span>
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer}>
        <List sx={{ cursor: 'pointer', minWidth: 300 }}>
          <ListItem onClick={e => openDialog('Create Logo')}>
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: '#1976d2' }}>
                <PaletteIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Create Logo" secondary="Create a business logo" />
          </ListItem>
          <ListItem onClick={e => openDialog('Create Image')}>
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: '#1976d2' }}>
                <AddPhotoIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Create Image" secondary="Generate an image" />
          </ListItem>

          <ListItem onClick={e => openDialog('Have AI Generate Your Content')}>
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: '#1976d2' }}>
                <AutoFixHighIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Generate Content" secondary="Have AI write your content" />
          </ListItem>

          <ListItem onClick={addWysiwygEditor}>
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: '#1976d2' }}>
                <ModeEditOutlineIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Add a text block" secondary="Add a plain text block" />
          </ListItem>


        </List>
      </Drawer>      
    <main className="controls-output-flex">
      <ReactGridLayout ref={gridLayoutRef} />
    </main>
    <Backdrop open={showSpinner} style={{ position: 'absolute', zIndex: 99 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={50} thickness={10} style={{ color: '#fff' }} />
        <div style={{ marginLeft: 15, color: '#fff' }}>
          <div style={{ fontSize: '1em' }}>Please wait...</div>
        </div>
      </div>
    </Backdrop>    
    </>
  );
}
