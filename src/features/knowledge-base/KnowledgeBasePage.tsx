import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockKBArticles } from '@/lib/mock-data';
import { Search, ThumbsUp, ThumbsDown, Eye, Plus, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [readModalOpen, setReadModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Hardware');

  const filteredArticles = mockKBArticles.filter((art: any) =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenArticle = (article: any) => {
    setSelectedArticle(article);
    setReadModalOpen(true);
  };

  const handleFeedback = (isHelpful: boolean) => {
    toast.success(isHelpful ? 'Thank you for your feedback! 👍' : 'Feedback recorded 👎', {
      description: 'Your rating helps improve KAA AI knowledge suggestions.'
    });
  };

  const handleCreateArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter article title');
      return;
    }
    toast.success(`KB Article Published!`, {
      description: `"${newTitle}" published under ${newCategory}.`
    });
    setCreateModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base & AI Self-Service"
        description="FAQs, technical guides, troubleshooting documentation, and AI-driven resolution suggestions"
      >
        <Button variant="default" onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Article
        </Button>
      </PageHeader>

      {/* AI Search Header Card */}
      <div className="glass rounded-xl p-8 border border-primary/30 relative overflow-hidden bg-gradient-to-r from-primary/10 via-violet-600/5 to-transparent text-center space-y-4 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30">
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
        {filteredArticles.map((article: any) => (
          <div 
            key={article.id} 
            onClick={() => handleOpenArticle(article)}
            className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 shadow-lg cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">{article.category}</Badge>
                <span className="text-[11px] text-muted-foreground">Updated {article.lastUpdated}</span>
              </div>

              <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-primary" /> {article.views} views
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ThumbsUp className="w-3.5 h-3.5" /> {article.helpful}% helpful
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      <Dialog open={readModalOpen} onOpenChange={setReadModalOpen}>
        <DialogContent className="max-w-xl bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">{selectedArticle?.category}</Badge>
              <span className="text-xs text-muted-foreground">Ref: KB-{selectedArticle?.id}</span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">{selectedArticle?.title}</DialogTitle>
          </DialogHeader>

          <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-3 text-xs text-foreground">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" /> Troubleshooting Procedure
            </h4>
            <p>1. Verify 24V DC power input to the main CPU rack LED indicator panel.</p>
            <p>2. Check profinet communication cable integrity between station 1 and master gateway.</p>
            <p>3. If red fault LED flashes 3 times, reset buffer memory via KAA Diagnostics Utility v4.2.</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
            <span className="text-muted-foreground">Was this resolution article helpful?</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleFeedback(true)} className="text-xs gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> Yes
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleFeedback(false)} className="text-xs gap-1">
                <ThumbsDown className="w-3.5 h-3.5 text-rose-400" /> No
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Article Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Publish KB Article</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a self-service troubleshooting article for KAA engineers and clients.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateArticleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Article Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="E.g., How to resolve Siemens PLC PROFIBUS communication fault"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Category</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              >
                <option value="Hardware">Hardware / Machinery</option>
                <option value="Electrical">Electrical / PLC</option>
                <option value="Network">Network / Connectivity</option>
                <option value="Software">Software & Licensing</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Publish Article
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
