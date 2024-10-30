import React from 'react';
import {
    Fab,
    InputLabel,
    MenuItem,
    Popover,
    FormControl,
    Select,
    Tab,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { HexColorPicker } from 'react-colorful';
import CancelIcon from '@mui/icons-material/Cancel';
import ColorizeIcon from '@mui/icons-material/Colorize';

const GridItem = ({ cell, onRemoveItem }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [color, setColor] = React.useState('#f9f9f9');
    const [textColor, setTextColor] = React.useState('#000000');
    const [tab, setTab] = React.useState('Background');

    const onTabSelected = (event, newValue) => {
        setTab(newValue);
    };

    const onChangeColorPicker = (color) => {
        setColor(color);
    };

    const handleClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const popoverId = open ? 'simple-popover' : undefined;

    const stopPropagation = (event) => {
        event.stopPropagation();
    };

    const isImageCell = cell?.content?.props?.src;

    return (
        <div
            style={
                isImageCell
                    ? { overflow: 'hidden' }
                    : { background: color, color: textColor }
            }
        >
            {cell.content}
            <button
                className="deleteButton ignore-drag"
                onClick={() => onRemoveItem(cell.key)}
                onMouseDown={stopPropagation}
                onTouchStart={stopPropagation}
            >
                <CancelIcon size="small" />
            </button>
            {!isImageCell && (
                <>
                    <Fab
                        type="button"
                        size="small"
                        aria-describedby={popoverId}
                        onClick={handleClick}
                        className="ignore-drag"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            padding: 0,
                            border: 0,
                            cursor: 'pointer',
                            margin: 5,
                            zIndex: 98,
                        }}
                    >
                        <ColorizeIcon />
                    </Fab>
                    <Popover
                        id={popoverId}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <div style={{ padding: 15 }}>
                            <TabContext value={tab}>
                                <TabList
                                    onChange={onTabSelected}
                                    aria-label="Tab Colors"
                                >
                                    <Tab label="Background" value="Background" />
                                    <Tab label="Font" value="Font" />
                                </TabList>
                                <TabPanel value="Background">
                                    <HexColorPicker color={color} onChange={setColor} />
                                </TabPanel>
                                <TabPanel value="Font">
                                    <HexColorPicker
                                        color={textColor}
                                        onChange={setTextColor}
                                    />
                                </TabPanel>
                            </TabContext>
                        </div>
                    </Popover>
                </>
            )}
        </div>
    );
};

GridItem.displayName = 'GridItem';

export default GridItem;
