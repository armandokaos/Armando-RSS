export const wallet = {
    sendTransaction: async ({ to, value, data }: { to: string; value: number; data: string }) => {
        console.log(`Sending transaction to: ${to}`);
        console.log(`Data: ${data}`);
        return { txHash: "0x123456789abcdef" };
    }
};
