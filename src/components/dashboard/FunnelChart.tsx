import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/contexts/BusinessContext';

export function FunnelChart() {
    const { deals, pipelineStages } = useBusiness();

    const sortedStages = [...pipelineStages].sort((a, b) => a.order - b.order);

    const stageData = sortedStages.map(stage => {
        const stageDeals = deals.filter(d => d.stageId === stage.id);
        const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
        return {
            ...stage,
            count: stageDeals.length,
            value: totalValue,
        };
    });

    const maxCount = Math.max(...stageData.map(s => s.count), 1);
    const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Funil de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {stageData.map((stage, index) => {
                        const widthPercent = (stage.count / maxCount) * 100;
                        // Create a funnel effect: each bar gets progressively narrower
                        const funnelWidth = 100 - (index * (60 / stageData.length));
                        const actualWidth = stage.count > 0 ? Math.max(widthPercent, 15) : 15;

                        return (
                            <div key={stage.id} className="relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-32 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: stage.color }}
                                            />
                                            <span className="text-sm font-medium text-foreground truncate">
                                                {stage.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 relative">
                                        <div
                                            className="h-10 rounded-lg flex items-center justify-between px-3 transition-all duration-300"
                                            style={{
                                                backgroundColor: `${stage.color}20`,
                                                width: `${Math.min(funnelWidth, actualWidth)}%`,
                                                borderLeft: `4px solid ${stage.color}`,
                                            }}
                                        >
                                            <span className="text-sm font-semibold text-foreground">
                                                {stage.count}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                R$ {stage.value.toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                            Total de Oportunidades: <span className="font-semibold text-foreground">{deals.length}</span>
                        </span>
                        <span className="text-muted-foreground">
                            Valor Total: <span className="font-semibold text-foreground">R$ {totalPipelineValue.toLocaleString('pt-BR')}</span>
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
