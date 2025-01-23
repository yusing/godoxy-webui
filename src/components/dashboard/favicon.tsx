import { Skeleton } from "@/components/ui/skeleton";
import Endpoints from "@/types/api/endpoints";
import { HomepageItem } from "@/types/api/entry/homepage_item";
import React, { useState } from "react";
import { Avatar, AvatarProps } from "../ui/avatar";

interface FavIconProps {
  size?: number | string;
  item?: HomepageItem;
  url?: string;
}

export const FavIcon: React.FC<FavIconProps & Omit<AvatarProps, "size">> = ({
  size,
  item,
  url,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  return (
    <Skeleton
      asChild
      height={props.height ?? size}
      width={props.width ?? size}
      loading={loading}
    >
      <Avatar
        name={item?.name ?? url ?? ""}
        shape={props.shape ?? "rounded"}
        height={props.height ?? size}
        width={props.width ?? size}
        borderless
        src={Endpoints.FavIcon(item?.alias, url)}
        onStatusChange={() => setLoading(false)}
        {...props}
      />
    </Skeleton>
  );
};
