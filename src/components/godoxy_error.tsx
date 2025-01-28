import "@/styles/logs.css";
import React from "react";
import { Prose } from "./ui/prose";

export const GoDoxyErrorText: React.FC<
  {
    err: string;
  } & Omit<React.ComponentProps<typeof Prose>, "dangerouslySetInnerHTML">
> = ({ err, ...props }) => {
  if (!err) return null;
  return (
    <Prose
      textWrap={"pretty"}
      {...props}
      dangerouslySetInnerHTML={{ __html: err }}
    />
  );
};
// export const GoDoxyErrorText: React.FC<
//   {
//     err: GoDoxyError;
//     level?: number;
//   } & TextProps
// > = ({ err, level, ...props }) => {
//   if (!err) return null;
//   if (typeof err === "string") {
//     return (
//       <Text as="pre" pl={2 * (level ?? 0)} {...props}>
//         {err}
//       </Text>
//     );
//   }
//   if ("subjects" in err) {
//     return (
//       <HStack pl={2 * (level ?? 0)}>
//         <Text as="pre" color="fg.warning" {...props}>
//           {err.subjects.join("/")}:{" "}
//         </Text>
//         <GoDoxyErrorText err={err.err} level={level} />
//       </HStack>
//     );
//   }
//   return (
//     <Stack pl={2 * (level ?? 0)} gap={0}>
//       <GoDoxyErrorText err={err.err} level={level} {...props} />
//       <For each={err.extras}>
//         {(extra, index) => (
//           <GoDoxyErrorText
//             err={extra}
//             key={index}
//             level={level ?? 0 + 1}
//             {...props}
//           />
//         )}
//       </For>
//     </Stack>
//   );
// };
