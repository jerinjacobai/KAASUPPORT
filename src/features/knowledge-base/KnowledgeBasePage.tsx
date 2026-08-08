import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockKBArticles } from '@/lib/mock-data';
import { Search, ThumbsUp, Eye, Plus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = mockKBArticles.filter(art =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base & AI Self-Service"
        description="FAQs, technical guides, troubleshooting documentation, and AI-driven resolution suggestions"
      >
        <Button variant="default" className="gap-2">
          <Plus className="w-4 h-4" /> Create Article
        </Button>
      </PageHeader>

      {/* AI Search Header Card */}
      <div className="glass rounded-xl p-8 border border-primary/30 relative overflow-hidden bg-gradient-to-r from-primary/10 via-violet-600/5 to-transparent text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> AI Knowledge Search Assistant
        </div>
        <h2 className="text-2xl font-bold text-foreground">How can we help you solve your issue today?</h2>
        
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Type error code, machine model, or question (e.g. Siemens PLC connection timeout)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background/80 backdrop-blur border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div key={article.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-xs">{article.category}</Badge>
                <span className="text-[11px] text-muted-foreground">Updated {article.lastUpdated}</span>
              </div>

              <h3 className="font-semibold text-base text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2">
                {article.title}
              </h3>
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-primary" /> {article.views} views
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ThumbsUp className="w-3.5 h-3.5" /> {article.helpful}% helpful
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
