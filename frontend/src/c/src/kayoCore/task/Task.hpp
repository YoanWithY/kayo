#pragma once
#include <cstdint>
#include <string>

namespace kayo {

class Task {
  public:
	const uint32_t id;

	/**
	 * Must be set in the this.run implementation.
	 */
	pthread_t thread;
	Task(uint32_t id);

	/**
	 * Has the responsiblity to set the `this.thread`.
	 */
	virtual void run() = 0;

	/**
	 * Must be called by the finish callback in js.
	 */
	void join();
	virtual ~Task() = default;
};

class StoreDataTask : public Task {
  public:
	std::string path;
	std::string file_name;
	std::string data;
	StoreDataTask(uint32_t id, std::string path, std::string file_name, std::string data);
	void run() override;
};

} // namespace kayo