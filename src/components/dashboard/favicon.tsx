import { Skeleton } from "@/components/ui/skeleton";
import type { HomepageItem } from "@/lib/api";
import { memo, useState } from "react";
import { Avatar, type AvatarProps } from "../ui/avatar";

interface FavIconProps extends Omit<AvatarProps, "size"> {
  size?: number | string;
  item?: HomepageItem;
  url?: string;
}

function FavIcon_({ size, item, url, ...props }: FavIconProps) {
  const [loading, setLoading] = useState(true);
  return (
    <Skeleton
      asChild
      height={props.height ?? size}
      width={props.width ?? size}
      loading={loading}
    >
      <Avatar
        name={item ? (item.name ?? item.alias) : url}
        shape={props.shape ?? "full"}
        borderless
        src={`/api/v1/favicon?alias=${item?.alias ?? ""}&url=${url ?? ""}`}
        onStatusChange={(detail) => {
          if (detail.status === "loaded") {
            setLoading(false);
          }
        }}
        {...props}
      />
    </Skeleton>
  );
}

export const FavIcon = memo(FavIcon_, (prev, next) => {
  return (
    prev.item?.alias === next.item?.alias &&
    prev.url === next.url &&
    prev.size === next.size
  );
});
