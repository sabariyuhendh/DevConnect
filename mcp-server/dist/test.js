import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
async function testMcpServer() {
    // Use the compiled code in dist/
    const child = spawn("node", ["dist/index.js"], {
        cwd: __dirname,
    });
    child.stderr.on("data", (data) => {
        console.error(`Server Log: ${data}`);
    });
    const sendRequest = (request) => {
        child.stdin?.write(JSON.stringify(request) + "\n");
    };
    return new Promise((resolve, reject) => {
        child.stdout?.on("data", (data) => {
            try {
                const response = JSON.parse(data.toString());
                console.log("Response:", JSON.stringify(response, null, 2));
                child.kill();
                resolve();
            }
            catch (e) {
                // console.log("Partial data or non-JSON:", data.toString());
            }
        });
        child.on("error", reject);
        // Give it a second to start
        setTimeout(() => {
            sendRequest({
                jsonrpc: "2.0",
                id: 1,
                method: "tools/list",
                params: {},
            });
        }, 1000);
    });
}
testMcpServer().catch(console.error);
