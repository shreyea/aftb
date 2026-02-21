import MobileFrame from "@/components/MobileFrame";
import FlowController from "@/components/FlowController";
import { ConfigProvider } from "@/components/ConfigContext";
import { defaultSiteConfig } from "@/site.config";

export default function Home() {
  return (
    <ConfigProvider config={defaultSiteConfig}>
      <MobileFrame>
        <FlowController />
      </MobileFrame>
    </ConfigProvider>
  );
}
