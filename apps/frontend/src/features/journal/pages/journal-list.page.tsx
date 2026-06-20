import { useState } from "react";
import { useGetJournals } from "../hooks/use-get-journals";
import { useCreateJournal } from "../hooks/use-create-journal";
import { useUpdateJournal } from "../hooks/use-update-journal";
import { useDeleteJournal } from "../hooks/use-delete-journal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { PlusCircle, Edit, Trash2, Calendar, Star, TrendingUp, TrendingDown, BookOpen, Percent } from "lucide-react";
import { toast } from "sonner";
import { TradingJournal, CreateJournalPayload } from "../types/journal.types";

export function JournalListPage() {
  const { data: journals, isLoading, refetch } = useGetJournals();
  const createMutation = useCreateJournal();
  const updateMutation = useUpdateJournal();
  const deleteMutation = useDeleteJournal();

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<TradingJournal | null>(null);

  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState<"OPEN" | "CLOSED">("OPEN");
  const [setup, setSetup] = useState("");
  const [emotions, setEmotions] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const handleOpenAdd = () => {
    setSelectedJournal(null);
    setSymbol("");
    setDirection("LONG");
    setEntryPrice("");
    setExitPrice("");
    setQuantity("");
    setStatus("OPEN");
    setSetup("");
    setEmotions("");
    setRating(null);
    setNotes("");
    setIsOpen(true);
  };

  const handleOpenEdit = (journal: TradingJournal) => {
    setSelectedJournal(journal);
    setSymbol(journal.symbol);
    setDirection(journal.direction);
    setEntryPrice(journal.entryPrice);
    setExitPrice(journal.exitPrice || "");
    setQuantity(journal.quantity);
    setStatus(journal.status);
    setSetup(journal.setup || "");
    setEmotions(journal.emotions || "");
    setRating(journal.rating);
    setNotes(journal.notes || "");
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim()) {
      toast.error("Symbol is required");
      return;
    }
    if (!entryPrice || Number(entryPrice) <= 0) {
      toast.error("Entry price must be greater than 0");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (status === "CLOSED" && (!exitPrice || Number(exitPrice) <= 0)) {
      toast.error("Exit price is required when trade is CLOSED");
      return;
    }

    const payload: CreateJournalPayload = {
      symbol: symbol.toUpperCase(),
      direction,
      entryPrice,
      exitPrice: status === "CLOSED" ? exitPrice : null,
      quantity,
      status,
      setup: setup || null,
      emotions: emotions || null,
      rating: rating || null,
      notes: notes || null,
    };

    try {
      if (selectedJournal) {
        await updateMutation.mutateAsync({ id: selectedJournal.id, data: payload });
        toast.success("Journal entry updated successfully!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Journal entry added successfully!");
      }
      setIsOpen(false);
      refetch();
    } catch (err) {
      toast.error("Failed to save journal entry");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Journal entry deleted successfully!");
        refetch();
      } catch (err) {
        toast.error("Failed to delete entry");
        console.error(err);
      }
    }
  };

  // Compute metrics
  const closedJournals = journals?.filter((j) => j.status === "CLOSED") || [];
  const totalPnL = closedJournals.reduce((sum, j) => sum + Number(j.pnl || 0), 0);
  const winTrades = closedJournals.filter((j) => Number(j.pnl || 0) > 0).length;
  const winRate = closedJournals.length > 0 ? (winTrades / closedJournals.length) * 100 : 0;
  const openTrades = journals?.filter((j) => j.status === "OPEN").length || 0;

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Trading Journal</h1>
          <p className="text-sm text-muted-foreground">Document and review your trades to analyze performance and setups.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Journal Entry
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/0 border-indigo-500/20">
          <CardHeader className="p-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Realized PnL</CardDescription>
            <CardTitle className={`text-2xl font-bold flex items-center gap-1.5 ${totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              IDR {totalPnL.toLocaleString("id-ID", { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Win Rate (Closed)</CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-400 flex items-center gap-1.5">
              <Percent className="h-5 w-5" />
              {winRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open Positions</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-400 flex items-center gap-1.5">
              <BookOpen className="h-5 w-5" />
              {openTrades} Trades
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Trades Logged</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{journals?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Journals Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Entry Price</TableHead>
                <TableHead className="text-right">Exit Price</TableHead>
                <TableHead className="text-right">PnL</TableHead>
                <TableHead>Setup</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!journals || journals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No journal entries logged yet. Add one manually or trade in a portfolio.
                  </TableCell>
                </TableRow>
              ) : (
                journals.map((journal) => {
                  const qty = Number(journal.quantity);
                  const entry = Number(journal.entryPrice);
                  const exit = journal.exitPrice ? Number(journal.exitPrice) : 0;
                  const pnlVal = journal.pnl ? Number(journal.pnl) : 0;

                  return (
                    <TableRow key={journal.id}>
                      <TableCell className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(journal.entryDate).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="font-bold">{journal.symbol}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={journal.direction === "LONG" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}
                        >
                          {journal.direction}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={journal.status === "OPEN" ? "secondary" : "default"}
                          className={journal.status === "OPEN" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : ""}
                        >
                          {journal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{qty.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right">IDR {entry.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">{journal.exitPrice ? `IDR ${exit.toLocaleString("id-ID", { minimumFractionDigits: 2 })}` : "-"}</TableCell>
                      <TableCell className={`text-right font-semibold ${pnlVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {journal.status === "CLOSED" ? `IDR ${pnlVal.toLocaleString("id-ID", { minimumFractionDigits: 2 })}` : "-"}
                      </TableCell>
                      <TableCell className="text-xs max-w-[120px] truncate" title={journal.setup || ""}>
                        {journal.setup || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${journal.rating && i < journal.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-500" onClick={() => handleOpenEdit(journal)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10" onClick={() => handleDelete(journal.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Journal Entry Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{selectedJournal ? "Edit Journal Entry" : "Add Journal Entry"}</DialogTitle>
              <DialogDescription>Record your trade entry details, metrics, and emotional state.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="j-symbol">Stock Ticker Symbol</Label>
                  <Input id="j-symbol" placeholder="e.g., GOTO" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="j-dir">Direction</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={direction === "LONG" ? "default" : "outline"} className="text-xs h-9" onClick={() => setDirection("LONG")}>
                      LONG (Buy)
                    </Button>
                    <Button type="button" variant={direction === "SHORT" ? "default" : "outline"} className="text-xs h-9" onClick={() => setDirection("SHORT")}>
                      SHORT (Sell)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="j-qty">Quantity</Label>
                  <Input id="j-qty" type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="j-entry">Entry Price (IDR)</Label>
                  <Input id="j-entry" type="number" placeholder="0" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="j-status">Trade Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={status === "OPEN" ? "default" : "outline"} className="text-xs h-9" onClick={() => setStatus("OPEN")}>
                      OPEN
                    </Button>
                    <Button type="button" variant={status === "CLOSED" ? "default" : "outline"} className="text-xs h-9" onClick={() => setStatus("CLOSED")}>
                      CLOSED
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="j-exit">Exit Price (IDR)</Label>
                  <Input
                    id="j-exit"
                    type="number"
                    placeholder="0"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    disabled={status === "OPEN"}
                    required={status === "CLOSED"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="j-setup">Setup / Strategy</Label>
                  <Input id="j-setup" placeholder="e.g., Breakout, Pullback" value={setup} onChange={(e) => setSetup(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="j-emotions">Emotions</Label>
                  <Input id="j-emotions" placeholder="e.g., Calm, Greedy, FOMO" value={emotions} onChange={(e) => setEmotions(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="j-rating">Trade Rating</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button key={star} type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRating(star)}>
                      <Star className={`h-5 w-5 ${rating && star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                    </Button>
                  ))}
                  {rating && (
                    <Button type="button" variant="link" className="text-xs text-muted-foreground ml-auto p-0" onClick={() => setRating(null)}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="j-notes">Notes / Reflection</Label>
                <Textarea id="j-notes" placeholder="Notes about the setup, execution, mistakes, lessons..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JournalListPage;
