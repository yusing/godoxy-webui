import { Skeleton } from "@/components/ui/skeleton";
import Endpoints from "@/types/api/endpoints";
import { HomepageItem } from "@/types/api/route/homepage_item";
import { memo, useState } from "react";
import { Avatar, AvatarProps } from "../ui/avatar";

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
        name={item?.name ?? url ?? item?.alias ?? ""}
        shape={props.shape ?? "full"}
        borderless
        src={Endpoints.favIcon(item?.alias, url)}
        onStatusChange={() => setLoading(false)}
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
