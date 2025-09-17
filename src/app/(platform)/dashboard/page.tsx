import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default function Page() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Building Your Application", href: "#" },
          { label: "Data Fetching" },
        ]}
      />
      <PageContainer>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </PageContainer>
    </>
  );
}
