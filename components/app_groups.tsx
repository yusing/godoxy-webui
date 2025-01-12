import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Spacer } from "@nextui-org/spacer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { toast } from "react-toastify";

import AppCard from "@/components/app_card";
import { getHomepageItems, HomepageItems } from "@/types/homepage_item";

export default function AppGroups() {
  const [homepageItems, setHomepageItems] = useState<HomepageItems>({});
  const router = useRouter();

  useEffect(() => {
    getHomepageItems()
      .then((items) => {
        setHomepageItems(items);
      })
      .catch((error) => toast.error(error));
  }, []);

  return (
    <Card className="w-full dark:bg-transparent light:bg-current dark:shadow-none light:shadow-md">
      {Object.entries(homepageItems).map(([category, items]) => (
        <Card key={`app-category-${category}`} className="mb-4" shadow="none">
          <CardHeader>
            <h2
              className="text-2xl font-bold"
              style={{ paddingLeft: 16, paddingTop: 8 }}
            >
              {category}
            </h2>
          </CardHeader>
          <CardBody className="p-0 m-0 w-full overflow-x-auto overflow-y-auto">
            <Spacer y={1} />
            <ResponsiveMasonry
              className="flex gap-4"
              columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4, 1200: 5 }}
            >
              <Masonry>
                {items.map((item) => (
                  <AppCard key={item.name} item={item} />
                ))}
              </Masonry>
            </ResponsiveMasonry>
          </CardBody>
        </Card>
      ))}
    </Card>
  );
}
