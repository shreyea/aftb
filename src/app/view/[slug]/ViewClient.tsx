"use client";

import { ConfigProvider } from "@/components/ConfigContext";
import MobileFrame from "@/components/MobileFrame";
import FlowController from "@/components/FlowController";
import type { SiteConfig } from "@/site.config";

export default function ViewClient({ config }: { config: SiteConfig }) {
    return (
        <ConfigProvider config={config}>
            <MobileFrame>
                <FlowController />
            </MobileFrame>
        </ConfigProvider>
    );
}
