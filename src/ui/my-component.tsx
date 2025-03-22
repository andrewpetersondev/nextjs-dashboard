// import { Background } from '@/components/Background'

// export const MyComponent = () => {
//     return (
//         <>
//             <Background pattern="grid" className="my-custom-background">
//                 <h1>Grid Pattern Background</h1>
//                 <p>This is some content inside the grid pattern background container.</p>
//             </Background>
//             <Background pattern="dot" className="my-custom-background">
//                 <h1>Dot Pattern Background</h1>
//                 <p>This is some content inside the dot pattern background container.</p>
//             </Background>
//         </>
//     )
// }

// filepath: /Users/ap/code/examples/tailwind-plus-spotlight/spotlight-ts/src/components/MyComponent.tsx
import { Background } from '@/src/ui/background'

export const MyComponent = () => {
    return (
        <>
            <Background pattern="grid">
                <h1 className="text-2xl font-bold">Grid Pattern Background</h1>
                <p className="text-base">This is some content inside the grid pattern background container.</p>
            </Background>
            <Background pattern="dot">
                <h1 className="text-2xl font-bold">Dot Pattern Background</h1>
                <p className="text-base">This is some content inside the dot pattern background container.</p>
            </Background>
        </>
    )
}