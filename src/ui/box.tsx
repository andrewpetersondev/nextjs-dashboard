// ignore this file and use container.tsx instead

import React from 'react';

interface BoxProps {
    children: React.ReactNode;
}

const Box: React.FC<BoxProps> = ({ children }) => {
    return (
        <div className="col-start-4 row-span-full row-start-1 max-sm:hidden text-gray-50/10 border-x border-x-current bg-[size:10px_10px] bg-fixed bg-[image:repeating-linear-gradient(315deg,var(--color-white)_0,var(--color-white)_0.25px,_transparent_0,_transparent_50%)] p-5">
            {children}
        </div>
    );
};

export default Box;