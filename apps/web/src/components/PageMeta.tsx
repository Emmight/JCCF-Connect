import { useEffect } from "react";

type PageMetaProps = {
  title: string;
  description: string;
};

export default function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = title;

    let metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.append(metaDescription);
    }

    metaDescription.content = description;
  }, [description, title]);

  return null;
}
