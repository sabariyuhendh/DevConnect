import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testMcpServer(): Promise<void> {
  // When running compiled dist/test.js, look for index.js in the same dir
  const child = spawn("node", [join(__dirname, "index.js")], {
    cwd: join(__dirname, ".."),
  });

  child.stderr.on("data", (data: Buffer) => {
    console.error(`Server Log: ${data}`);
  });

  const sendRequest = (request: any) => {
    child.stdin?.write(JSON.stringify(request) + "\n");
  };

  return new Promise((resolve, reject) => {
    child.stdout?.on("data", (data: Buffer) => {
      try {
        const response = JSON.parse(data.toString());
        console.log("Response:", JSON.stringify(response, null, 2));
        child.kill();
        resolve();
      } catch (e) {
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
