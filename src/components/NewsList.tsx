import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type NewsItem } from "@/lib/stockApi";
import { Newspaper, Clock } from "lucide-react";

export function NewsList({ news }: { news: NewsItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Newspaper className="h-4 w-4" /> Latest News Headlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {news.map((item, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-muted-foreground font-medium">{item.source}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(item.publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
