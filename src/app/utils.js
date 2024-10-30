export const makeId = () => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  };
  
  export const getWindowWidth = () => {
    if (typeof window !== 'undefined') {
        return window?.innerWidth
        || document?.documentElement?.clientWidth
        || document?.body?.clientWidth;
    }

    return 1400;
  };
  

export function newlineToParagaph(text) {
    try {
        const newline = '\n';
        const lines = text.split(newline);
        return lines.map((line, i) => {
            if (line?.includes('**')) {
                return (<h3 key={line}>
                    {line}
                </h3>)
            }

            return (
                <p key={line}>
                    {line}
                </p>
            );
        });
    } catch (error) {
        return text;
    }
}

export function newlineToWysiwygData(text) {
    try {
        const newline = '\n';
        const lines = text.split(newline);

        return lines.reduce((acc, next) => {
            if (next?.includes('**')) {
                acc = acc.concat({
                    type: 'heading-one',
                    children: [
                        { text: next },
                    ]
                })
            } else {
                acc = acc.concat({
                    type: 'paragraph',
                    children: [
                        { text: next },
                    ]
                })
            }

            return acc;

        }, [])
    } catch (error) {
        return [{
            type: 'paragraph',
            children: [
                { text: 'Edit your content here' },
            ]
        }];
    }
}