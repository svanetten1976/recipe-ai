import React, { forwardRef, useImperativeHandle, useState } from 'react';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CancelIcon from '@mui/icons-material/Cancel';

import { map, find, forEach, reject } from 'lodash';
import { getWindowWidth, makeId } from './utils';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { getBreakpointFromWidth } from 'react-grid-layout/build/responsiveUtils';
import GridItem from './components/grid-item';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/react-grid-layout.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const getX = (index, cols) => (index * 2) % (cols || 12);

const ReactGridLayout = forwardRef((props, ref) => {
    const width = getWindowWidth();
    const breakPoint = getBreakpointFromWidth(props.breakpoints, width);

    const [breakpoint, setBreakpoint] = useState(breakPoint);
    const [cols, setCols] = useState(props.cols);
    const [cells, setCells] = useState([]);
    const [layout, setLayout] = useState([]);

    const generateLayout = (cellName, index, c) => {
        const initLayout = {};
        forEach(Object.keys(props.cols), (key) => {
            let x = (index * 2) % (c || 12);
            x = isNaN(x) ? 0 : x;
            initLayout[key] = {
                i: cellName,
                x,
                y: Infinity, // puts it at the bottom
                w: 2,
                h: 2,
            };
        });

        return initLayout;
    };

    const onLayoutChange = (layout, allLayout) => {
        forEach(Object.keys(props.cols), (breakpoint) => {
            forEach(allLayout[breakpoint], (item) => {
                const cell = find(cells, { key: item.i });
                cell.layout[breakpoint] = item;
            });
        });

        // this.setState({
        //   cells,
        // });
    };

    const getCellsLayout = () => {
        const initLayout = {};
        forEach(Object.keys(props.cols), (key) => {
            initLayout[key] = cells.map((cell) => cell.layout[key]);
        });

        return initLayout;
    };

    const onAddCell = (content = null) => {
        const cellName = makeId();
        setCells((cells) =>
            cells.concat({
                key: cellName,
                content,
                layout: generateLayout(
                    cellName,
                    cells.length,
                    cols[breakpoint]
                ),
            })
        );
    };

    const onBreakpointChange = (breakpoint, cols) => {
        setBreakpoint(breakpoint);
        setCols(cols);
    };

    useImperativeHandle(ref, () => ({
        addWidget(content) {
            onAddCell(content);
        },
    }));

    const onRemoveItem = (cellName) => {
        setCells(reject(cells, { key: cellName }));
    };

    const stopPropagation = (event) => {
        event.stopPropagation();
    };

    const layouts = getCellsLayout();

    return (
        <div>
            <ResponsiveReactGridLayout
                breakpoints={props.breakpoints}
                rowHeight={100}
                onLayoutChange={onLayoutChange}
                onBreakpointChange={onBreakpointChange}
                layouts={layouts}
                useCSSTransforms={false}
                margin={[0, 0]}
            >
                {cells?.map((cell, index) => {
                    return (
                        <div className="reactGridItem" key={cell.key}>
                            <GridItem cell={cell} onRemoveItem={onRemoveItem} />
                        </div>
                    );
                })}
            </ResponsiveReactGridLayout>
        </div>
    );
});

ReactGridLayout.defaultProps = {
    cols: { lg: 12, md: 10, sm: 6 },
    breakpoints: { lg: 1200, md: 996, sm: 768 },
};

ReactGridLayout.displayName = 'ReactGridLayout';

export default ReactGridLayout;
