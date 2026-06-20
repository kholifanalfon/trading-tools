import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetPortfolios } from "../hooks/use-get-portfolios";
import { useCreatePortfolio } from "../hooks/use-create-portfolio";
import { useDeletePortfolio } from "../hooks/use-delete-portfolio";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { PlusCircle, Wallet, Trash2 } from "lucide-react";
import { toast } from "sonner";

function formatRupiahInput(value: string): string {
  if (!value) return "";
  const clean = value.replace(/\D/g, "");
  if (!clean) return "";
  return Number(clean).toLocaleString("id-ID");
}

function parseRupiahInput(value: string): string {
  return value.replace(/\./g, "");
}

export function PortfolioListPage() {
  const { data: portfolios, isLoading } = useGetPortfolios();
  const createMutation = useCreatePortfolio();
  const deleteMutation = useDeletePortfolio();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [balance, setBalance] = useState("0");

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Portfolio name is required");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name,
        description: description || undefined,
        balance: balance || "0",
      });
      toast.success("Portfolio created successfully");
      setIsCreateOpen(false);
      setName("");
      setDescription("");
      setBalance("0");
    } catch (err) {
      toast.error("Failed to create portfolio");
      console.error(err);
    }
  };

  const handleDelete = async (id: number, name: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page when deleting
    if (confirm(`Are you sure you want to delete portfolio "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Portfolio deleted successfully");
      } catch (err) {
        toast.error("Failed to delete portfolio");
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Trading Portfolios</h1>
          <p className="text-sm text-muted-foreground">Manage your multiple investment and trading portfolios.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Portfolio
        </Button>
      </div>

      {!portfolios || portfolios.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <Wallet className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <CardTitle className="mb-2">No Portfolios Found</CardTitle>
          <CardDescription className="mb-6">Get started by creating your first trading portfolio to track your cash and stock positions.</CardDescription>
          <Button onClick={() => setIsCreateOpen(true)}>Create First Portfolio</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Link key={portfolio.id} to={`/portfolios/${portfolio.id}`} className="block transition duration-200 hover:-translate-y-1">
              <Card className="h-full flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-md transition-all">
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold">{portfolio.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1.5 text-xs">{portfolio.description || "No description provided."}</CardDescription>
                    </div>
                    <Wallet className="h-5 w-5 text-indigo-400 shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 py-2">
                  <span className="text-xs text-muted-foreground block">Cash Balance</span>
                  <span className="text-xl font-bold text-emerald-400">IDR {Number(portfolio.balance).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span>
                </CardContent>
                <CardFooter className="border-t border-border/40 px-4 py-2 flex justify-between items-center text-sm">
                  <span className="text-xs text-muted-foreground">Updated {new Date(portfolio.updatedAt).toLocaleDateString("id-ID")}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10 h-8 w-8"
                      onClick={(e) => handleDelete(portfolio.id, portfolio.name, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Portfolio Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Create Trading Portfolio</DialogTitle>
              <DialogDescription>Add a new portfolio to organize your trading activities.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Portfolio Name</Label>
                <Input id="name" placeholder="e.g., Swing Trading, Long Term" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" placeholder="Briefly describe the strategy or purpose" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Initial Cash Balance (IDR)</Label>
                <Input id="balance" type="text" placeholder="0" value={formatRupiahInput(balance)} onChange={(e) => setBalance(parseRupiahInput(e.target.value))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PortfolioListPage;
