import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export class TestEnvironment {
  public testDir: string = '';
  
  async setup(): Promise<void> {
    // Create temporary directory for testing
    this.testDir = await mkdtemp(join(tmpdir(), 'dataweave-test-'));
  }
  
  async teardown(): Promise<void> {
    // Clean up test directory
    if (this.testDir) {
      await rm(this.testDir, { recursive: true, force: true });
    }
  }
  
  getTestProjectPath(projectName: string = 'test-project'): string {
    return join(this.testDir, projectName);
  }
}

export const testEnv = new TestEnvironment();