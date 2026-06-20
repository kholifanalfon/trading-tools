import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetPortfolio } from "../hooks/use-get-portfolio";
import { useAddTransaction } from "../hooks/use-add-transaction";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const portfolioId = parseInt(id || "0", 10);

  const { data: portfolio, isLoading, refetch } = useGetPortfolio(portfolioId);
  const addTransactionMutation = useAddTransaction();

  // Form states for transaction modal
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"BUY" | "SELL" | "DEPOSIT" | "WITHDRAW">("BUY");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [fee, setFee] = useState("0");
  const [notes, setNotes] = useState("");

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((type === "BUY" || type === "SELL") && !symbol.trim()) {
      toast.error("Symbol is required for BUY/SELL");
      return;
    }
    if ((type === "BUY" || type === "SELL") && (!quantity || Number(quantity) <= 0)) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Price/Amount must be greater than 0");
      return;
    }

    try {
      await addTransactionMutation.mutateAsync({
        portfolioId,
        data: {
          type,
          symbol: type === "BUY" || type === "SELL" ? symbol.toUpperCase() : null,
          quantity: type === "BUY" || type === "SELL" ? quantity : null,
          price,
          fee: fee || "0",
          notes: notes || null,
        },
      });
      toast.success("Transaction recorded successfully!");
      setIsOpen(false);
      // Reset form
      setSymbol("");
      setQuantity("");
      setPrice("");
      setFee("0");
      setNotes("");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record transaction");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Portfolio Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested portfolio does not exist or you do not have permission to view it.</p>
        <Link to="/portfolios">
          <Button className="mt-4">Back to Portfolios</Button>
        </Link>
      </div>
    );
  }

  // Calculate total portfolio cost value
  const totalHoldingsValue = portfolio.assets.reduce((sum, asset) => {
    return sum + Number(asset.quantity) * Number(asset.averagePurchasePrice);
  }, 0);

  const totalValue = Number(portfolio.balance) + totalHoldingsValue;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/portfolios">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{portfolio.name}</h1>
          <p className="text-sm text-muted-foreground">{portfolio.description || "Portfolio details and positions."}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/0 border-indigo-500/20">
          <CardHeader className="p-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Equity Value</CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-400">IDR {totalValue.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cash Balance</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-400">IDR {Number(portfolio.balance).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Holdings Cost Value</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-400">IDR {totalHoldingsValue.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground">Asset Holdings</h2>
        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Asset Positions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Average Price</TableHead>
                <TableHead className="text-right">Total Cost Basis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No holdings in this portfolio yet.
                  </TableCell>
                </TableRow>
              ) : (
                portfolio.assets.map((asset) => {
                  const qty = Number(asset.quantity);
                  const avgPrice = Number(asset.averagePurchasePrice);
                  const costBasis = qty * avgPrice;

                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-bold text-indigo-400">{asset.symbol}</TableCell>
                      <TableCell className="text-right">{qty.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right">IDR {avgPrice.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">IDR {costBasis.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction History Table */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Transaction Logs</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price/Amount</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No transactions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  portfolio.transactions.map((tx) => {
                    const isBuy = tx.type === "BUY";
                    const isSell = tx.type === "SELL";
                    const isDeposit = tx.type === "DEPOSIT";
                    const isWithdraw = tx.type === "WITHDRAW";

                    const qty = Number(tx.quantity || 0);
                    const priceVal = Number(tx.price || 0);
                    const feeVal = Number(tx.fee || 0);

                    const totalValTx = isBuy ? qty * priceVal + feeVal : isSell ? qty * priceVal - feeVal : priceVal; // for deposit / withdraw

                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="text-xs text-muted-foreground">{new Date(tx.transactionDate).toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          {isBuy && <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">BUY</Badge>}
                          {isSell && <Badge className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20">SELL</Badge>}
                          {isDeposit && <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">DEPOSIT</Badge>}
                          {isWithdraw && <Badge className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/20">WITHDRAW</Badge>}
                        </TableCell>
                        <TableCell className="font-bold">{tx.symbol || "-"}</TableCell>
                        <TableCell className="text-right">{tx.quantity ? qty.toLocaleString("id-ID") : "-"}</TableCell>
                        <TableCell className="text-right">IDR {priceVal.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">IDR {feeVal.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right font-medium">IDR {totalValTx.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-xs max-w-xs truncate" title={tx.notes || ""}>
                          {tx.notes || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleTransactionSubmit}>
            <DialogHeader>
              <DialogTitle>Record Portfolio Transaction</DialogTitle>
              <DialogDescription>Record a new financial transaction or trade position.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tx-type">Transaction Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["BUY", "SELL", "DEPOSIT", "WITHDRAW"] as const).map((t) => (
                    <Button key={t} type="button" variant={type === t ? "default" : "outline"} className="text-xs py-1 h-9 px-1" onClick={() => setType(t)}>
                      {t}
                    </Button>
                  ))}
                </div>
              </div>

              {(type === "BUY" || type === "SELL") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tx-symbol">Stock Ticker Symbol</Label>
                    <Input id="tx-symbol" placeholder="e.g., BBRI, GOTO" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tx-qty">Quantity (Shares)</Label>
                      <Input id="tx-qty" type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tx-price">Price per Share</Label>
                      <Input id="tx-price" type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                  </div>
                </>
              )}

              {(type === "DEPOSIT" || type === "WITHDRAW") && (
                <div className="space-y-2">
                  <Label htmlFor="tx-amount">Amount (IDR)</Label>
                  <Input id="tx-amount" type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tx-fee">Transaction Fee (IDR)</Label>
                <Input id="tx-fee" type="number" placeholder="0" value={fee} onChange={(e) => setFee(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tx-notes">Notes (Optional)</Label>
                <Input id="tx-notes" placeholder="Brief context or trade setup name" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addTransactionMutation.isPending}>
                {addTransactionMutation.isPending ? "Recording..." : "Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PortfolioDetailPage;
