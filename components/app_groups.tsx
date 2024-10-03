import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Spacer } from "@nextui-org/spacer";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import AppCard from "@/components/app_card";
import { getHomepageItems, HomepageItems } from "@/types/homepage_item";

export default function AppGroups() {
  const [homepageItems, setHomepageItems] = useState<HomepageItems>({});

  useEffect(() => {
    const fetchHomepageItems = async () => {
      const items = await getHomepageItems();

      setHomepageItems(items);
    };

    fetchHomepageItems().catch((error) => toast.error(error));
  }, []);

  return (
    <div className="w-full bg-default-50 rounded-xl shadow-md">
      <div className="w-full">
        {Object.entries(homepageItems).map(([category, items]) => (
          <Card key={`app-category-${category}`} className="mb-4 p-3">
            <CardHeader>
              <h2 className="text-2xl font-bold">{category}</h2>
            </CardHeader>
            <CardBody>
              <Spacer y={1} />
              <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                {items.map((item) => (
                  <AppCard key={item.name} item={item} />
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
